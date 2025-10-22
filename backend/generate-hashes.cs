using System;
using BCrypt.Net;

// Simple BCrypt hash generator for our seed data
var passwords = new Dictionary<string, string>
{
    { "admin", "password123" },
    { "doctor", "doctor123" },
    { "nurse", "nurse123" }
};

Console.WriteLine("-- BCrypt hashes for SQL seed script:");
Console.WriteLine("-- Cost factor: 12");
Console.WriteLine();

foreach (var kvp in passwords)
{
    var hash = BCrypt.HashPassword(kvp.Value, 12);
    Console.WriteLine($"    -- {kvp.Key} : {kvp.Value}");
    Console.WriteLine($"    '{hash}',");
    Console.WriteLine();
}

Console.WriteLine("Copy these hashes to backend/seeds/01-seed-users.sql");
