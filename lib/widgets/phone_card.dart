import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/phone.dart';

class PhoneCard extends StatelessWidget {
  final Phone phone;
  final VoidCallback onTap;

  const PhoneCard({
    super.key,
    required this.phone,
    required this.onTap,
  });

  String _formatPrice(double price) {
    final parts = price.toStringAsFixed(2).split('.');
    final intPart = parts[0];
    final decPart = parts[1];

    // Add comma separators
    final buffer = StringBuffer();
    int count = 0;
    for (int i = intPart.length - 1; i >= 0; i--) {
      if (count > 0 && count % 3 == 0) {
        buffer.write(',');
      }
      buffer.write(intPart[i]);
      count++;
    }

    return '₱${buffer.toString().split('').reversed.join()}.$decPart';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.06),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Row(
            children: [
              // Product image
              Hero(
                tag: 'phone-image-${phone.id ?? phone.name}',
                child: Container(
                  width: 110,
                  height: 120,
                  decoration: BoxDecoration(
                    color: const Color(0xFF252525),
                  ),
                  child: phone.imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: phone.imageUrl,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => const Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF2979FF),
                              ),
                            ),
                          ),
                          errorWidget: (context, url, error) => const Icon(
                            Icons.phone_android,
                            color: Color(0xFF555555),
                            size: 40,
                          ),
                        )
                      : const Icon(
                          Icons.phone_android,
                          color: Color(0xFF555555),
                          size: 40,
                        ),
                ),
              ),

              // Product info
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Brand chip
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2979FF).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          phone.brand.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFF2979FF),
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Name
                      Text(
                        phone.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          height: 1.2,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),

                      // Price
                      Text(
                        _formatPrice(phone.price),
                        style: const TextStyle(
                          color: Color(0xFF2979FF),
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Chevron
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Icon(
                  Icons.chevron_right_rounded,
                  color: Colors.white.withValues(alpha: 0.2),
                  size: 24,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
