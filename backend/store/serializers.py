import uuid
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from .models import Address, Category, Order, OrderItem, Payment, Product

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "phone",
            "address",
        ]

    def validate(self, data):
        if data["password"] != data.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "address",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "role", "date_joined"]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "address",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "product_count"]

    def get_product_count(self, obj) -> int:
        return obj.products.count()

    def validate_slug(self, value: str) -> str:
        return value.lower()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "category",
            "category_name",
            "image_url",
            "model_3d_url",
            "material",
            "weight",
            "stock",
            "is_featured",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}

    def validate_slug(self, value: str) -> str:
        return value.lower()

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data["title"])
        return super().create(validated_data)


class AddressSerializer(serializers.ModelSerializer):
    formatted = serializers.ReadOnlyField()

    class Meta:
        model = Address
        fields = [
            "id",
            "user",
            "label",
            "full_name",
            "phone",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
            "formatted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "formatted", "created_at", "updated_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        if validated_data.get("is_default"):
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
        elif not Address.objects.filter(user=user).exists():
            validated_data["is_default"] = True
        return Address.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if validated_data.get("is_default"):
            Address.objects.filter(user=user, is_default=True).exclude(
                id=instance.id
            ).update(is_default=False)
        return super().update(instance, validated_data)


class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "user",
            "user_name",
            "amount",
            "currency",
            "method",
            "status",
            "transaction_id",
            "provider",
            "notes",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order",
            "user",
            "user_name",
            "amount",
            "currency",
            "transaction_id",
            "provider",
            "paid_at",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj) -> str:
        return obj.user.get_full_name() or obj.user.username


class PaymentAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["status", "notes"]

    def update(self, instance, validated_data):
        status = validated_data.get("status")
        if status == "paid" and not instance.paid_at:
            instance.paid_at = timezone.now()
        instance.status = status or instance.status
        instance.notes = validated_data.get("notes", instance.notes)
        instance.save(update_fields=["status", "notes", "paid_at", "updated_at"])
        return instance


class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source="product.title", read_only=True)
    product_image = serializers.CharField(source="product.image_url", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_title",
            "product_image",
            "quantity",
            "unit_price",
            "subtotal",
        ]

    def get_subtotal(self, obj) -> str:
        return str(obj.subtotal)


class CartItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=99)


class OrderCreateSerializer(serializers.Serializer):
    items = CartItemInputSerializer(many=True)
    shipping_address = serializers.CharField(min_length=5, required=False, allow_blank=True)
    address_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    payment_method = serializers.ChoiceField(
        choices=[choice[0] for choice in Payment.METHOD_CHOICES], default="card"
    )

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Cart cannot be empty.")
        product_ids = [item["product_id"] for item in items]
        unique_product_ids = set(product_ids)
        products = Product.objects.filter(id__in=product_ids)
        if products.count() != len(unique_product_ids):
            raise serializers.ValidationError("One or more products not found.")
        product_map = {p.id: p for p in products}
        quantity_map: dict[int, int] = {}
        for item in items:
            quantity_map[item["product_id"]] = (
                quantity_map.get(item["product_id"], 0) + item["quantity"]
            )
        for item in items:
            product = product_map[item["product_id"]]
            if product.stock < quantity_map[item["product_id"]]:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.title}'. Available: {product.stock}."
                )
        return items

    def validate(self, attrs):
        shipping_address = attrs.get("shipping_address", "").strip()
        address_id = attrs.get("address_id")
        user = self.context["request"].user

        if not address_id and not shipping_address:
            raise serializers.ValidationError(
                {"shipping_address": "Provide shipping_address or address_id."}
            )

        if address_id:
            try:
                address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist as exc:
                raise serializers.ValidationError({"address_id": "Address not found."}) from exc
            attrs["shipping_address"] = address.formatted
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        items_data = validated_data.pop("items")
        payment_method = validated_data.pop("payment_method", "card")
        validated_data.pop("address_id", None)
        order = Order.objects.create(user=user, **validated_data)

        product_map = {
            product.id: product
            for product in Product.objects.select_for_update().filter(
                id__in=[item["product_id"] for item in items_data]
            )
        }

        for item_data in items_data:
            product = product_map[item_data["product_id"]]
            quantity = item_data["quantity"]
            if product.stock < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.title}'. Available: {product.stock}."
                )
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.price,
            )
            product.stock -= quantity
            product.save(update_fields=["stock"])

        order.calculate_total()

        payment_status = "pending" if payment_method == "cod" else "paid"
        Payment.objects.create(
            order=order,
            user=user,
            amount=order.total_price,
            method=payment_method,
            status=payment_status,
            transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
            paid_at=timezone.now() if payment_status == "paid" else None,
            provider="mock_gateway",
        )
        if payment_status == "paid":
            order.status = "confirmed"
            order.save(update_fields=["status", "updated_at"])
        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "user_name",
            "status",
            "total_price",
            "shipping_address",
            "notes",
            "items",
            "payment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "total_price", "created_at", "updated_at"]

    def get_user_name(self, obj) -> str:
        return obj.user.get_full_name() or obj.user.username


class OrderAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status", "shipping_address", "notes"]
