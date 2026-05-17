from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Category, Product, Order, OrderItem, Address, Payment


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Qayyam Profile", {"fields": ("role", "phone", "address")}),
    )
    list_display = ["username", "email", "role", "is_staff", "date_joined"]
    list_filter = ["role", "is_staff", "is_active"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "product_count"]
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Products")
    def product_count(self, obj):
        return obj.products.count()


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["unit_price", "subtotal"]

    @admin.display(description="Subtotal")
    def subtotal(self, obj):
        return f"${obj.subtotal:,.2f}"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "price", "stock", "is_featured", "created_at"]
    list_filter = ["category", "is_featured"]
    list_editable = ["price", "stock", "is_featured"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "total_price", "created_at"]
    list_filter = ["status"]
    readonly_fields = ["total_price", "created_at", "updated_at"]
    inlines = [OrderItemInline]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "label", "city", "country", "is_default", "updated_at"]
    list_filter = ["country", "is_default"]
    search_fields = ["user__username", "full_name", "phone", "city", "postal_code"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "user", "amount", "method", "status", "created_at"]
    list_filter = ["status", "method", "currency"]
    search_fields = ["transaction_id", "user__username", "order__id"]
