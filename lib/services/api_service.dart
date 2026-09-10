import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/phone.dart';

class ApiService {
  static const String _baseUrl = 'http://your-api-url.com';
  static const String _endpoint = '$_baseUrl/phones.php';
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer dwyn-students-api-8f92k3',
  };

  /// GET — Fetch all phones
  Future<List<Phone>> getPhones() async {
    try {
      final response = await http.get(
        Uri.parse(_endpoint),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final dynamic decoded = jsonDecode(response.body);

        // Handle both direct list and wrapped response { "data": [...] }
        List<dynamic> jsonList;
        if (decoded is List) {
          jsonList = decoded;
        } else if (decoded is Map && decoded.containsKey('data')) {
          jsonList = decoded['data'] as List<dynamic>;
        } else if (decoded is Map && decoded.containsKey('phones')) {
          jsonList = decoded['phones'] as List<dynamic>;
        } else {
          return [];
        }

        return jsonList
            .map((json) => Phone.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /// GET — Fetch a single phone by ID
  Future<Phone?> getPhone(int id) async {
    try {
      final response = await http.get(
        Uri.parse('$_endpoint?id=$id'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final dynamic decoded = jsonDecode(response.body);

        Map<String, dynamic> jsonMap;
        if (decoded is Map<String, dynamic>) {
          if (decoded.containsKey('data') && decoded['data'] is Map) {
            jsonMap = decoded['data'] as Map<String, dynamic>;
          } else {
            jsonMap = decoded;
          }
        } else {
          return null;
        }

        return Phone.fromJson(jsonMap);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /// POST — Create a new phone
  Future<bool> createPhone(Phone phone) async {
    try {
      final response = await http.post(
        Uri.parse(_endpoint),
        headers: _headers,
        body: jsonEncode(phone.toJson()),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  /// POST with _method: PUT — Update an existing phone (PHP compatibility)
  Future<bool> updatePhone(Phone phone) async {
    try {
      final body = phone.toJson();
      body['_method'] = 'PUT';

      final response = await http.post(
        Uri.parse(_endpoint),
        headers: _headers,
        body: jsonEncode(body),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  /// POST with _method: DELETE — Delete a phone by ID (PHP compatibility)
  Future<bool> deletePhone(int id) async {
    try {
      final body = {
        'id': id,
        '_method': 'DELETE',
      };

      final response = await http.post(
        Uri.parse(_endpoint),
        headers: _headers,
        body: jsonEncode(body),
      );

      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}
