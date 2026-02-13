import 'package:flutter_test/flutter_test.dart';
import 'package:pocket_av_app/main.dart';

void main() {
  testWidgets('app renders', (WidgetTester tester) async {
    await tester.pumpWidget(const PocketAvApp());
    expect(find.text('Pocket AV'), findsOneWidget);
  });
}
