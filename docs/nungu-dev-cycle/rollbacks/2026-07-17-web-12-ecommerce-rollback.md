# Rollback Reference

Issue: WEB-12 ecommerce Yoco

Rollback payment safety changes by reverting the payment config/service patch only with explicit approval. Preferred rollback is to keep payment disabled until a valid provider secret is configured.
