output "db_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}

output "db_name" {
  value = var.db_name
}

output "db_security_group_id" {
  value = aws_security_group.rds.id
}

output "db_credentials_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}
