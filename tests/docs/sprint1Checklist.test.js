import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const checklistPath = path.join(rootDir, 'docs/test-plan/sprint1_checklist.md');

describe('R3: Sprint 1 QA Test Checklist (docs/test-plan/sprint1_checklist.md)', () => {
  test('checklist file exists in docs/test-plan directory', () => {
    assert.ok(fs.existsSync(checklistPath), 'Checklist file docs/test-plan/sprint1_checklist.md must exist');
  });

  test('covers all 15 functional requirement categories (BDC-F-001 to BDC-F-015)', () => {
    const content = fs.readFileSync(checklistPath, 'utf8');

    for (let i = 1; i <= 15; i++) {
      const padded = String(i).padStart(3, '0');
      const reqId = `BDC-F-${padded}`;
      assert.ok(
        content.includes(reqId),
        `Checklist must reference requirement ${reqId}`
      );
    }
  });

  test('contains all 30 checkable functional test cases (TC-F-01.1 to TC-F-15.2)', () => {
    const content = fs.readFileSync(checklistPath, 'utf8');

    const expectedTestCases = [
      'TC-F-01.1', 'TC-F-01.2', 'TC-F-01.3',
      'TC-F-02.1', 'TC-F-02.2',
      'TC-F-03.1', 'TC-F-03.2',
      'TC-F-04.1',
      'TC-F-05.1',
      'TC-F-06.1', 'TC-F-06.2', 'TC-F-06.3', 'TC-F-06.4',
      'TC-F-07.1', 'TC-F-07.2', 'TC-F-07.3',
      'TC-F-08.1',
      'TC-F-09.1',
      'TC-F-10.1', 'TC-F-10.2',
      'TC-F-11.1', 'TC-F-11.2',
      'TC-F-12.1', 'TC-F-12.2', 'TC-F-12.3',
      'TC-F-13.1', 'TC-F-13.2',
      'TC-F-14.1',
      'TC-F-15.1', 'TC-F-15.2'
    ];

    assert.equal(expectedTestCases.length, 30, 'There must be exactly 30 functional test cases');

    for (const tcId of expectedTestCases) {
      // Must exist as a checkable markdown item: - [ ] **TC-F-xx.x**
      const pattern = new RegExp(`-\\s*\\[[ xX]\\]\\s*\\*\\*${tcId}\\*\\*`);
      assert.match(
        content,
        pattern,
        `Test case ${tcId} must be present as a checkable Markdown checkbox item (- [ ] **${tcId}**)`
      );
    }
  });

  test('contains all 8 checkable Non-Functional test cases (TC-NF-01.1 to TC-NF-05.2)', () => {
    const content = fs.readFileSync(checklistPath, 'utf8');
    const expectedNFR = [
      'TC-NF-01.1', 'TC-NF-02.1', 'TC-NF-02.2', 'TC-NF-03.1',
      'TC-NF-04.1', 'TC-NF-04.2', 'TC-NF-05.1', 'TC-NF-05.2'
    ];
    for (const tcId of expectedNFR) {
      const pattern = new RegExp(`-\\s*\\[[ xX]\\]\\s*\\*\\*${tcId}\\*\\*`);
      assert.match(content, pattern, `Test case ${tcId} must be present as a checkable item`);
    }
  });

  test('contains all 6 checkable Security & Robustness test cases (TC-SR-01.1 to TC-SR-05.1)', () => {
    const content = fs.readFileSync(checklistPath, 'utf8');
    const expectedSecurity = [
      'TC-SR-01.1', 'TC-SR-02.1', 'TC-SR-03.1',
      'TC-SR-04.1', 'TC-SR-04.2', 'TC-SR-05.1'
    ];
    for (const tcId of expectedSecurity) {
      const pattern = new RegExp(`-\\s*\\[[ xX]\\]\\s*\\*\\*${tcId}\\*\\*`);
      assert.match(content, pattern, `Test case ${tcId} must be present as a checkable item`);
    }
  });

  test('includes Traceability & Coverage Matrix and Team Sign-off section', () => {
    const content = fs.readFileSync(checklistPath, 'utf8');

    assert.ok(content.includes('Traceability & Coverage Matrix'), 'Must include Traceability Matrix');
    assert.ok(content.includes('Sign-off Summary'), 'Must include Sign-off Summary');
  });
});
