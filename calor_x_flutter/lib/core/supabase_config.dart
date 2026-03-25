import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const url = 'https://lurcmwqvgjfsfzsmvkne.supabase.co';
  static const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cmNtd3F2Z2pmc2Z6c212a25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTAzMTUsImV4cCI6MjA4Nzg4NjMxNX0.IL8dKbsTxpecQlyxcEyd7To5d0bzvFfnr8b-lClvCR0';

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
  }
}
