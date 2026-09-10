class Phone {
  final int? id;
  final String name;
  final String brand;
  final String model;
  final double price;
  final String description;
  final String imageUrl;

  Phone({
    this.id,
    required this.name,
    required this.brand,
    required this.model,
    required this.price,
    required this.description,
    required this.imageUrl,
  });

  factory Phone.fromJson(Map<String, dynamic> json) {
    return Phone(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id']?.toString() ?? ''),
      name: json['name']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      model: json['model']?.toString() ?? '',
      price: json['price'] is double
          ? json['price']
          : double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
      description: json['description']?.toString() ?? '',
      imageUrl: json['image_url']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{
      'name': name,
      'brand': brand,
      'model': model,
      'price': price,
      'description': description,
      'image_url': imageUrl,
    };
    if (id != null) {
      data['id'] = id;
    }
    return data;
  }

  Phone copyWith({
    int? id,
    String? name,
    String? brand,
    String? model,
    double? price,
    String? description,
    String? imageUrl,
  }) {
    return Phone(
      id: id ?? this.id,
      name: name ?? this.name,
      brand: brand ?? this.brand,
      model: model ?? this.model,
      price: price ?? this.price,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}
