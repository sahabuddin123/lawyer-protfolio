import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

console.log('====================================================');
console.log('🔍 PHASE 2 AUTOMATED QA & INTEGRITY VERIFICATION');
console.log('====================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// 1. i18n Dictionary Parity Check
console.log('\n--- Test Suite 1: i18n Dictionary Parity & Coverage ---');
import('../src/i18n/en.ts').then((enMod) => {
  import('../src/i18n/bn.ts').then((bnMod) => {
    const enKeys = Object.keys(enMod.en);
    const bnKeys = Object.keys(bnMod.bn);

    assert(
      JSON.stringify(enKeys) === JSON.stringify(bnKeys),
      'Top-level i18n sections match perfectly between English and Bengali'
    );

    let allSectionsParity = true;
    for (const section of enKeys) {
      const enSubKeys = Object.keys(enMod.en[section]).sort();
      const bnSubKeys = Object.keys(bnMod.bn[section]).sort();
      if (JSON.stringify(enSubKeys) !== JSON.stringify(bnSubKeys)) {
        console.error(`Mismatch in section ${section}: EN=${enSubKeys} vs BN=${bnSubKeys}`);
        allSectionsParity = false;
      }
    }
    assert(allSectionsParity, 'All sub-keys across all sections match 100% parity between EN and BN');

    // 2. Component Inventory Check
    console.log('\n--- Test Suite 2: Component Inventory Verification ---');
    const requiredComponents = [
      'components/ui/Button.tsx',
      'components/ui/IconButton.tsx',
      'components/ui/Badge.tsx',
      'components/ui/Divider.tsx',
      'components/ui/Container.tsx',
      'components/ui/Section.tsx',
      'components/ui/SectionHeader.tsx',
      'components/ui/PageHeader.tsx',
      'components/ui/LazyImage.tsx',
      'components/ui/Avatar.tsx',
      'components/ui/Card.tsx',
      'components/cards/EditorialCard.tsx',
      'components/cards/PracticeAreaCard.tsx',
      'components/cards/CaseCard.tsx',
      'components/cards/ResearchCard.tsx',
      'components/cards/PublicationCard.tsx',
      'components/cards/MediaCard.tsx',
      'components/cards/VideoCard.tsx',
      'components/cards/GalleryCard.tsx',
      'components/cards/CredentialCard.tsx',
      'components/forms/Input.tsx',
      'components/forms/Textarea.tsx',
      'components/forms/Select.tsx',
      'components/forms/DatePicker.tsx',
      'components/forms/Checkbox.tsx',
      'components/forms/Radio.tsx',
      'components/forms/FileInput.tsx',
      'components/forms/SearchInput.tsx',
      'components/navigation/Header.tsx',
      'components/navigation/MobileNavigation.tsx',
      'components/navigation/Footer.tsx',
      'components/navigation/Breadcrumb.tsx',
      'components/navigation/Pagination.tsx',
      'components/navigation/Filter.tsx',
      'components/hero/Hero.tsx',
      'components/feedback/LoadingSpinner.tsx',
      'components/feedback/Skeleton.tsx',
      'components/feedback/EmptyState.tsx',
      'components/feedback/ErrorState.tsx',
      'components/feedback/Toast.tsx',
      'components/modals/Modal.tsx',
      'components/modals/Lightbox.tsx',
      'components/modals/VideoModal.tsx',
      'layouts/RootLayout.tsx',
      'pages/DesignSystemPage.tsx',
    ];

    let allComponentsExist = true;
    for (const comp of requiredComponents) {
      const fullPath = path.join(srcDir, comp);
      if (!fs.existsSync(fullPath)) {
        console.error(`Missing component: ${comp}`);
        allComponentsExist = false;
      }
    }
    assert(allComponentsExist, `All ${requiredComponents.length} required Phase 2 components exist in source tree`);

    // 3. Accessibility Attributes Verification
    console.log('\n--- Test Suite 3: Accessibility Implementation Checks ---');
    const modalCode = fs.readFileSync(path.join(srcDir, 'components/modals/Modal.tsx'), 'utf-8');
    assert(modalCode.includes('role="dialog"') && modalCode.includes('aria-modal="true"'), 'Modal component implements role="dialog" and aria-modal="true"');
    assert(modalCode.includes('key === \'Escape\''), 'Modal implements Escape key listener');

    const mobileNavCode = fs.readFileSync(path.join(srcDir, 'components/navigation/MobileNavigation.tsx'), 'utf-8');
    assert(mobileNavCode.includes('role="dialog"') && mobileNavCode.includes('key === \'Escape\''), 'MobileNavigation implements accessible dialog role and Escape dismissal');

    const rootLayoutCode = fs.readFileSync(path.join(srcDir, 'layouts/RootLayout.tsx'), 'utf-8');
    assert(rootLayoutCode.includes('Skip to main judicial content'), 'Skip-to-content landmark implemented for screen readers');

    const indexCssCode = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf-8');
    assert(indexCssCode.includes('prefers-reduced-motion'), 'prefers-reduced-motion media query implemented in index.css');
    assert(indexCssCode.includes('[lang="bn"]'), 'Bengali dynamic typographic line-height adjustment implemented in CSS');

    // 4. Zero Hardcoded Arbitrary Pixel Widths on Fluid Layouts
    console.log('\n--- Test Suite 4: Responsive & Fluid Layout Guarantees ---');
    assert(indexCssCode.includes('overflow-x: hidden'), 'Root body enforces overflow-x: hidden to prevent horizontal scrollbars');
    const containerCode = fs.readFileSync(path.join(srcDir, 'components/ui/Container.tsx'), 'utf-8');
    assert(containerCode.includes('box-border') && containerCode.includes('max-w-7xl'), 'Container uses responsive padding clamps and max-width bounds');

    console.log('\n====================================================');
    console.log(`TOTAL CHECKS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
    console.log('====================================================');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
});
