import 'package:flutter/material.dart';

void main() {
  runApp(const PocketAvApp());
}

class PocketAvApp extends StatelessWidget {
  const PocketAvApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pocket AV',
      theme: ThemeData(
        colorSchemeSeed: Colors.deepPurple,
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(
          child: Text('Pocket AV'),
        ),
      ),
    );
  }
}
