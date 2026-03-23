from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("comwrap", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="employee",
            name="allocatedDaysPerMonth",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
