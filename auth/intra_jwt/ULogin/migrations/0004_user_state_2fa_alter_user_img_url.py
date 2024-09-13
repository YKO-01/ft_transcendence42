# Generated by Django 4.2.15 on 2024-09-09 16:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ULogin', '0003_alter_user_full_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='state_2fa',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='user',
            name='img_url',
            field=models.ImageField(default='profile_pics/1177568.png', upload_to='profile_pics'),
        ),
    ]
