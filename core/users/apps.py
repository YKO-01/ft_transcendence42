from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    def ready(self):
        # Import the User model here to avoid circular import issues
        from .models import User

        # Define a function to reset is_online for all users
        def reset_is_online(sender, **kwargs):
            User.objects.update(is_online=0)
            print("Reset all users' is_online status to 0.")

        # Connect the reset function to the post_migrate signal
        post_migrate.connect(reset_is_online, sender=self)
