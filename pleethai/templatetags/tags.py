from django import template
from pleethai.models import SysWordThai
register = template.Library()

# Custom template tag for get thai list 
@register.filter(name='get_thai_list')
def get_thai_list(value):
    return SysWordThai.objects.filter(japanese_id=value).order_by("order")