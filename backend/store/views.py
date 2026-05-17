from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Address, Category, Order, Payment, Product
from .permissions import IsAdminOrReadOnly, IsAdminUserRole
from .serializers import (
    AddressSerializer,
    AdminUserSerializer,
    CategorySerializer,
    OrderAdminUpdateSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    PaymentAdminUpdateSerializer,
    PaymentSerializer,
    ProductSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        qs = Product.objects.select_related("category").all()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        featured = self.request.query_params.get("featured")
        if category:
            qs = qs.filter(category__slug=category)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if featured == "true":
            qs = qs.filter(is_featured=True)
        return qs

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request):
        qs = Product.objects.filter(is_featured=True).select_related("category")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Address.objects.filter(user=user)
        if user.is_staff or user.role == "admin":
            user_id = self.request.query_params.get("user_id")
            if user_id:
                qs = Address.objects.filter(user_id=user_id)
        return qs

    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        address = self.get_object()
        Address.objects.filter(user=address.user, is_default=True).update(is_default=False)
        address.is_default = True
        address.save(update_fields=["is_default", "updated_at"])
        return Response(AddressSerializer(address).data)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options", "delete"]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related("items__product").select_related(
            "user", "payment"
        )
        if user.role == "admin" or user.is_staff:
            status_filter = self.request.query_params.get("status")
            customer = self.request.query_params.get("customer")
            if status_filter:
                qs = qs.filter(status=status_filter)
            if customer:
                qs = qs.filter(user_id=customer)
            return qs.all()
        return qs.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        if self.action in ["partial_update", "update"] and (
            self.request.user.is_staff or self.request.user.role == "admin"
        ):
            return OrderAdminUpdateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if not (user.is_staff or user.role == "admin"):
            if instance.status not in ("pending", "confirmed"):
                return Response(
                    {"error": "Only pending or confirmed orders can be edited."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = OrderAdminUpdateSerializer(
                instance,
                data={
                    "shipping_address": request.data.get(
                        "shipping_address", instance.shipping_address
                    ),
                    "notes": request.data.get("notes", instance.notes),
                    "status": instance.status,
                },
                partial=True,
            )
        else:
            serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(instance).data)

    @action(detail=True, methods=["patch"], url_path="cancel")
    def cancel(self, request, pk=None):
        order = self.get_object()
        if request.user != order.user and not (
            request.user.is_staff or request.user.role == "admin"
        ):
            return Response(
                {"error": "You do not have permission to cancel this order."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if order.status not in ("pending", "confirmed"):
            return Response(
                {"error": "This order cannot be cancelled at its current stage."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = "cancelled"
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.role == "admin"):
            return Response(
                {"error": "Only admins can delete orders."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related("user", "order")
        if user.role == "admin" or user.is_staff:
            status_filter = self.request.query_params.get("status")
            method = self.request.query_params.get("method")
            if status_filter:
                qs = qs.filter(status=status_filter)
            if method:
                qs = qs.filter(method=method)
            return qs
        return qs.filter(user=user)

    @action(
        detail=True, methods=["patch"], url_path="admin-update", permission_classes=[IsAdminUserRole]
    )
    def admin_update(self, request, pk=None):
        payment = self.get_object()
        serializer = PaymentAdminUpdateSerializer(payment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PaymentSerializer(payment).data)


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserRole]
    queryset = User.objects.all().order_by("-date_joined")
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get("role")
        search = self.request.query_params.get("search")
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        password = self.request.data.get("password", "changeme1234")
        user = serializer.save()
        user.set_password(password)
        user.save(update_fields=["password"])
