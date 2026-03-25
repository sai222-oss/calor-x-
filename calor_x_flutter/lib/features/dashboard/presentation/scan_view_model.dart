import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:camera/camera.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import '../data/dashboard_models.dart';

class ScanScreenState {
  final bool isUploading;
  final String? previewImage;
  final int scansToday;
  final String? scanError;
  final bool isCameraLive;
  final bool isTurboMode; // AR Depth Sensing
  final bool isArSupported;
  final FlashMode flashMode;
  final NutritionData? nutritionData;

  ScanScreenState({
    this.isUploading = false,
    this.previewImage,
    this.scansToday = 0,
    this.scanError,
    this.isCameraLive = true,
    this.isTurboMode = false,
    this.isArSupported = true, // Default to true until checked
    this.flashMode = FlashMode.off,
    this.nutritionData,
  });

  ScanScreenState copyWith({
    bool? isUploading,
    String? previewImage,
    int? scansToday,
    String? scanError,
    bool? isCameraLive,
    bool? isTurboMode,
    bool? isArSupported,
    FlashMode? flashMode,
    NutritionData? nutritionData,
  }) {
    return ScanScreenState(
      isUploading: isUploading ?? this.isUploading,
      previewImage: previewImage ?? this.previewImage,
      scansToday: scansToday ?? this.scansToday,
      scanError: scanError ?? this.scanError,
      isCameraLive: isCameraLive ?? this.isCameraLive,
      isTurboMode: isTurboMode ?? this.isTurboMode,
      isArSupported: isArSupported ?? this.isArSupported,
      flashMode: flashMode ?? this.flashMode,
      nutritionData: nutritionData ?? this.nutritionData,
    );
  }
}

class ScanViewModel extends StateNotifier<ScanScreenState> {
  final Ref ref;
  ScanViewModel(this.ref) : super(ScanScreenState()) {
    _checkTodayScans();
  }

  static const platform = MethodChannel('com.calorx.arcore/depth');

  Future<void> checkArSupport() async {
    try {
      final bool supported = await platform.invokeMethod('isDepthSupported');
      state = state.copyWith(isArSupported: supported);
      if (!supported) {
        state = state.copyWith(isTurboMode: false);
      }
    } catch (e) {
      state = state.copyWith(isArSupported: false, isTurboMode: false);
    }
  }

  Future<void> _checkTodayScans() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    final countRes = await Supabase.instance.client
        .from('meal_logs')
        .select('id')
        .eq('user_id', user.id)
        .gte('logged_at', '${todayStr}T00:00:00');
    
    state = state.copyWith(scansToday: (countRes as List).length);
  }

  void toggleTurboMode() {
    state = state.copyWith(isTurboMode: !state.isTurboMode);
  }

  void setFlashMode(FlashMode mode) {
    state = state.copyWith(flashMode: mode);
  }

  void reset() {
    debugPrint("ScanViewModel: Performing state reset...");
    clearPreview();
    state = state.copyWith(isUploading: false, scanError: null, isCameraLive: true, nutritionData: null);
  }

  void clearPreview() {
    state = state.copyWith(previewImage: null);
  }

  void setScanError(String error) {
    state = state.copyWith(scanError: error, isUploading: false);
  }

  Future<void> processFile(File file, {double? depthDistanceMeters}) async {
    state = state.copyWith(isUploading: true, scanError: null);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) throw Exception('err_not_logged_in'.tr());

      // 1. Upload to storage
      final fileName = '${user.id}/${DateTime.now().millisecondsSinceEpoch}_scan.jpg';
      await Supabase.instance.client.storage.from('food-images').upload(fileName, file);
      
      final imageUrl = Supabase.instance.client.storage.from('food-images').getPublicUrl(fileName);

      // 1.5. Prepare base64 for re-analysis support
      final bytes = await file.readAsBytes();
      final imageBase64 = base64Encode(bytes);

      // 2. Invoke Edge Function
      final res = await Supabase.instance.client.functions.invoke('analyze-food', body: {
        'imageBase64': imageBase64, // Send high-res base64 directly for best accuracy
        'userId': user.id,
        'turboMode': state.isTurboMode,
        if (depthDistanceMeters != null) 'depthDistanceMeters': depthDistanceMeters,
      });

      if (res.status != 200) {
        throw Exception(res.data['error'] ?? 'err_analysis_failed'.tr());
      }

      final analysisData = NutritionData.fromJson(res.data).copyWithImageBase64(imageBase64, imageUrl);
      // We would navigate here, but it's handled in the UI
      state = state.copyWith(isUploading: false, previewImage: file.path, nutritionData: analysisData);
      // Return analysisData to UI
    } catch (e) {
      state = state.copyWith(isUploading: false, scanError: e.toString());
    }
  }

  Future<void> pickFromGallery() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      await processFile(File(image.path));
    }
  }
}

final scanViewModelProvider = StateNotifierProvider<ScanViewModel, ScanScreenState>((ref) {
  return ScanViewModel(ref);
});
