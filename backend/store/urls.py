from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("categories", views.CategoryViewSet, basename="category")
router.register("products", views.ProductViewSet, basename="product")
router.register("addresses", views.AddressViewSet, basename="address")
router.register("orders", views.OrderViewSet, basename="order")
router.register("payments", views.PaymentViewSet, basename="payment")
router.register("customers", views.CustomerViewSet, basename="customer")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/profile/", views.UserProfileView.as_view(), name="profile"),
]
