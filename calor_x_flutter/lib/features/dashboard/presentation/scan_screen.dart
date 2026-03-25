import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:camera/camera.dart';
import 'scan_view_model.dart';
import '../../../core/i18n_service.dart';
import '../../../core/plan_service.dart';
import '../../../core/theme.dart';
import 'dart:io';
import 'package:flutter/services.dart';

class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({super.key});

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends ConsumerState<ScanScreen> with WidgetsBindingObserver {
  CameraController? _cameraController;
  bool _isCameraInitialized = false;
  bool _isInitializing = false;

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    debugPrint("AppLifecycleState changed to: $state");
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _isCameraInitialized = false;
      _cameraController?.dispose();
      _cameraController = null;
    } else if (state == AppLifecycleState.resumed) {
      _resetScanner();
    }
  }

  @override
  void deactivate() {
    debugPrint("ScanScreen: deactivate called");
    _isCameraInitialized = false;
    _cameraController?.dispose();
    _cameraController = null;
    super.deactivate();
  }

  @override
  void initState() {
    super.initState();
    debugPrint("ScanScreen: initState called with key ${widget.key}");
    WidgetsBinding.instance.addObserver(this);
    
    // Use Future.microtask to avoid "modified provider while building" Riverpod error
    Future.microtask(() {
      if (mounted) ref.read(scanViewModelProvider.notifier).reset();
    });
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _initializeCamera();
        ref.read(scanViewModelProvider.notifier).checkArSupport();
      }
    });
  }

  Future<void> _initializeCamera() async {
    debugPrint("Initializing camera...");
    if (mounted) {
      setState(() {
        _isCameraInitialized = false;
        _isInitializing = true;
      });
    }

    // Dispose old controller if exists
    if (_cameraController != null) {
      try {
        debugPrint("Disposing active camera controller before re-init");
        await _cameraController!.dispose();
      } catch (e) {
        debugPrint("Error disposing old camera controller: $e");
      }
      _cameraController = null;
      // IMPORTANT: Give hardware time to release!
      await Future.delayed(const Duration(milliseconds: 500));
    }

    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        debugPrint("No cameras found");
        return;
      }
      
      debugPrint("Creating fresh CameraController");
      _cameraController = CameraController(cameras[0], ResolutionPreset.high, enableAudio: false);
      
      await _cameraController!.initialize();
      debugPrint("CameraController initialized successfully");
      
      if (mounted) {
        setState(() => _isCameraInitialized = true);
      }
    } catch (e) {
      debugPrint("Camera initialization failed: $e");
      if (mounted) {
        setState(() => _isCameraInitialized = false);
      }
    } finally {
      if (mounted) {
        setState(() => _isInitializing = false);
      }
    }
  }

  @override
  void dispose() {
    debugPrint("ScanScreen: dispose called");
    WidgetsBinding.instance.removeObserver(this);
    if (_cameraController != null) {
      _cameraController!.dispose();
      _cameraController = null;
    }
    super.dispose();
  }

  static const platform = MethodChannel('com.calorx.arcore/depth');

  Future<void> _resetScanner() async {
    debugPrint("Resetting scanner state and camera...");
    ref.read(scanViewModelProvider.notifier).reset();
    
    if (mounted) {
       setState(() {
         _isCameraInitialized = false;
       });
    }

    await _initializeCamera();
    
    if (_cameraController != null && _cameraController!.value.isInitialized) {
      try {
        await _cameraController!.setFlashMode(FlashMode.off);
        ref.read(scanViewModelProvider.notifier).setFlashMode(FlashMode.off);
      } catch (e) {
        debugPrint("Failed to reset flash on init: $e");
      }
    }
  }

  Future<void> _toggleFlash() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    
    final currentMode = ref.read(scanViewModelProvider).flashMode;
    final newMode = currentMode == FlashMode.torch ? FlashMode.off : FlashMode.torch;
    
    try {
      await _cameraController!.setFlashMode(newMode);
      ref.read(scanViewModelProvider.notifier).setFlashMode(newMode);
    } catch (e) {
      debugPrint("Failed to set flash mode: $e");
    }
  }

  Future<void> _captureAndProcess() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    
    double? depthDistance;
    final state = ref.read(scanViewModelProvider);

    if (state.isTurboMode) {
      try {
        final double result = await platform.invokeMethod('getCenterDepth');
        depthDistance = result;
      } catch (e) {
        debugPrint("AR depth sensing failed: '$e'. Falling back to AI only estimation.");
      }
    }

    try {
      final image = await _cameraController!.takePicture();
      debugPrint("Picture taken successfully at: ${image.path}");

      // 1. Process the file immediately after capture while camera is releasing
      debugPrint("Processing file in background...");
      await ref.read(scanViewModelProvider.notifier).processFile(File(image.path), depthDistanceMeters: depthDistance);
    } catch (e) {
      debugPrint("Fatal error during capture or process: $e");
      ref.read(scanViewModelProvider.notifier).setScanError(e.toString());
    } finally {
      // 2. ABSOLUTELY GUARANTEED DISPOSAL
      debugPrint("FINALLY: Disposing camera hardware and turning off indicators");
      if (_cameraController != null) {
        try {
          // Extra step for budget Android drivers: 
          // pause/stop before total destruction
          if (_cameraController!.value.isInitialized) {
            await _cameraController!.pausePreview();
          }
          await _cameraController!.dispose();
          debugPrint("Camera hardware release successful after pausePreview");
        } catch (e) {
          debugPrint("Failed to dispose camera in finally: $e");
        }
        _cameraController = null;
        if (mounted) {
          setState(() => _isCameraInitialized = false);
        }
      }
      ref.read(scanViewModelProvider.notifier).setFlashMode(FlashMode.off);
    }
    
    if (mounted && ref.read(scanViewModelProvider).scanError == null && ref.read(scanViewModelProvider).nutritionData != null) {
      debugPrint("Analysis success, NAVIGATING TO RESULTS (GO)");
      // Using context.go ensures this ScanScreen is removed from the tree and disposed, 
      // releasing the camera hardware immediately.
      context.go('/results', extra: ref.read(scanViewModelProvider).nutritionData);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(scanViewModelProvider);
    final plan = ref.watch(planViewModelProvider);
    final viewModel = ref.read(scanViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: (state.isUploading && state.previewImage != null)
              ? Image.file(File(state.previewImage!), fit: BoxFit.cover)
              : _isCameraInitialized 
                ? CameraPreview(_cameraController!)
                : const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor)),
          ),

          if (state.previewImage == null && !state.isUploading)
             _buildViewfinder(state),

          _buildHeader(context, state, plan),
          _buildBottomControls(context, state, viewModel),

          if (state.isUploading)
            _buildLoadingOverlay(),

          if (state.scanError != null)
            _buildErrorModal(state, viewModel),
        ],
      ),
    );
  }

  Widget _buildViewfinder(ScanScreenState state) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(
                color: state.isTurboMode ? AppTheme.primaryColor : Colors.white.withOpacity(0.8), 
                width: 3
              ),
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  spreadRadius: 2000,
                ),
              ],
            ),
            child: Stack(
              children: [
                if (state.isTurboMode)
                  Center(
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.5), width: 1),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(LucideIcons.zap, color: AppTheme.primaryColor, size: 24),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (state.isTurboMode) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.gauge, color: AppTheme.primaryColor, size: 14),
                  const SizedBox(width: 8),
                  Text(
                    'AR Depth Sensing Active'.toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ScanScreenState state, PlanState plan) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 16,
      left: 20,
      right: 20,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              _buildCircleButton(LucideIcons.x, () => context.go('/dashboard')),
              const SizedBox(width: 12),
              _buildCircleButton(
                LucideIcons.refreshCw, 
                _resetScanner,
                color: Colors.white10,
              ),
              const SizedBox(width: 12),
              _buildCircleButton(
                state.flashMode == FlashMode.torch ? LucideIcons.zap : LucideIcons.zapOff, 
                _toggleFlash,
                color: state.flashMode == FlashMode.torch ? AppTheme.primaryColor : Colors.white10,
              ),
            ],
          ),
          Row(
            children: [
              const Icon(LucideIcons.camera, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text('scan_title'.tr(), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              plan.isPro ? 'PRO' : 'FREE',
              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomControls(BuildContext context, ScanScreenState state, ScanViewModel viewModel) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 220,
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20)],
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Text(
              'scan_title'.tr(),
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'scan_tap_subtitle'.tr(),
              style: const TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.only(bottom: 40, left: 32, right: 32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCircleButton(LucideIcons.upload, () => viewModel.pickFromGallery(), size: 56),
                  
                   GestureDetector(
                    onTap: state.isUploading ? null : _captureAndProcess,
                    child: Container(
                      width: 80,
                      height: 80,
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.3), width: 6),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          color: state.isTurboMode ? AppTheme.primaryColor : Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                             BoxShadow(
                              color: (state.isTurboMode ? AppTheme.primaryColor : Colors.white).withOpacity(0.5),
                              blurRadius: 15,
                            )
                          ],
                        ),
                        child: state.isTurboMode ? const Icon(LucideIcons.zap, color: Colors.white) : null,
                      ),
                    ),
                  ),

                  _buildCircleButton(
                    state.isArSupported ? LucideIcons.zap : LucideIcons.zapOff, 
                    () {
                      if (state.isArSupported) {
                        viewModel.toggleTurboMode();
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('scan_ar_fallback').tr()),
                        );
                      }
                    }, 
                    size: 56, 
                    color: state.isTurboMode ? AppTheme.primaryColor : Colors.white10),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCircleButton(IconData icon, VoidCallback onTap, {double size = 44, Color color = Colors.white10}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Icon(icon, color: Colors.white, size: size * 0.45),
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.8),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: AppTheme.primaryColor),
            const SizedBox(height: 20),
            Text('scan_analysing'.tr(), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('scan_please_wait'.tr(), style: const TextStyle(color: Colors.white54, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorModal(ScanScreenState state, ScanViewModel viewModel) {
     return Container(
      color: Colors.black.withOpacity(0.6),
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(LucideIcons.alertTriangle, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text('scan_err_analysis_failed_title'.tr(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(state.scanError ?? 'Error', textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _resetScanner(),
                    child: Text('scan_try_again'.tr()),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
