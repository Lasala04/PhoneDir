import 'package:flutter_test/flutter_test.dart';
import 'package:phonedir/main.dart';

void main() {
  testWidgets('PhoneDir app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const PhoneDirApp());
    expect(find.text('PhoneDir'), findsOneWidget);
  });
}
