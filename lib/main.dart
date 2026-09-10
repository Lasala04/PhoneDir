import 'package:flutter/material.dart';
import 'screens/phone_list_screen.dart';

void main() {
  runApp(const PhoneDirApp());
}

class PhoneDirApp extends StatelessWidget {
  const PhoneDirApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PhoneDir',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        // Core colors
        scaffoldBackgroundColor: const Color(0xFF0D0D0D),
        primaryColor: const Color(0xFF2979FF),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2979FF),
          secondary: Color(0xFF2979FF),
          surface: Color(0xFF1A1A1A),
          error: Colors.redAccent,
        ),

        // AppBar
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0D0D0D),
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
          iconTheme: IconThemeData(color: Colors.white),
        ),

        // Cards
        cardTheme: CardThemeData(
          color: const Color(0xFF1A1A1A),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),

        // Text
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
          headlineMedium: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Color(0xFFBBBBBB)),
          bodySmall: TextStyle(color: Color(0xFF888888)),
        ),

        // Elevated buttons
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2979FF),
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),

        // Floating action button
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Color(0xFF2979FF),
          foregroundColor: Colors.white,
          elevation: 8,
        ),

        // Snack bar
        snackBarTheme: SnackBarThemeData(
          behavior: SnackBarBehavior.floating,
          backgroundColor: const Color(0xFF2979FF),
          contentTextStyle: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),

        // Divider
        dividerTheme: DividerThemeData(
          color: Colors.white.withValues(alpha: 0.06),
          thickness: 1,
        ),

        // Dialog
        dialogTheme: DialogThemeData(
          backgroundColor: const Color(0xFF1A1A1A),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          titleTextStyle: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),

        // Splash / ripple
        splashColor: const Color(0xFF2979FF).withValues(alpha: 0.1),
        highlightColor: const Color(0xFF2979FF).withValues(alpha: 0.05),
      ),
      home: const PhoneListScreen(),
    );
  }
}
