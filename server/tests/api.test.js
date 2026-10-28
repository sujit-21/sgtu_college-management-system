import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

test('College Management System - API Verification Suite', async (t) => {
  let adminToken = '';
  let studentToken = '';

  await t.test('GET /api/health should return system status healthy', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
  });

  await t.test('POST /api/auth/login should fail with invalid credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'wrong@sgtu.edu', password: 'InvalidPassword' }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('POST /api/auth/login should authenticate Admin successfully', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@sgtu.edu', password: 'Admin@123' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'ADMIN');
    assert.ok(data.token);
    adminToken = data.token;
  });

  await t.test('POST /api/auth/login should authenticate Student successfully', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'arjun.kumar@sgtu.edu', password: 'Student@123' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'STUDENT');
    assert.ok(data.token);
    studentToken = data.token;
  });

  await t.test('GET /api/auth/me should return hydrated profile with valid token', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'STUDENT');
    assert.equal(data.user.profile.fullName, 'Arjun Kumar');
  });

  await t.test('Role Guard: Student cannot access Admin dashboard stats', async () => {
    const res = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('Admin can access Admin dashboard statistics', async () => {
    const res = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.stats.totalStudents >= 1);
    assert.ok(data.stats.totalDepartments >= 1);
  });

  await t.test('GET /api/departments should return all departments with counts', async () => {
    const res = await fetch(`${BASE_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.length >= 2);
  });

  await t.test('GET /api/students should support search, filter and pagination', async () => {
    const res = await fetch(`${BASE_URL}/students?search=Arjun&page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.some((s) => s.fullName.includes('Arjun')));
    assert.equal(data.pagination.page, 1);
  });
});
