# Generated by Django 4.2.15 on 2024-09-11 14:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ULogin', '0007_remove_user_totp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='img_url',
            field=models.CharField(default='https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png', max_length=255),
        ),
    ]
