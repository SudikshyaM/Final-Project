# Generated by Django 5.0.3 on 2024-12-14 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_alter_booking_booking_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='fullname',
            field=models.CharField(default='Unknown User', max_length=100),
        ),
        migrations.AddField(
            model_name='booking',
            name='phone',
            field=models.CharField(default='0000000000', max_length=15),
        ),
    ]
