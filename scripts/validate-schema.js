#!/usr/bin/env node
/**
 * Schema Validation Script
 * Extracts and validates JSON-LD schema markup from production pages
 */

const pages = [
  {
    url: 'http://localhost:3000/services/windshield-replacement',
    type: 'Service Page',
    expectedSchemas: ['Service', 'FAQPage', 'BreadcrumbList']
  },
  {
    url: 'http://localhost:3000/locations/denver-co',
    type: 'Location Page',
    expectedSchemas: ['AutoRepair', 'FAQPage', 'BreadcrumbList']
  },
  {
    url: 'http://localhost:3000/vehicles/toyota-camry-windshield-replacement-denver',
    type: 'Vehicle Page',
    expectedSchemas: ['Service', 'Product', 'BreadcrumbList']
  },
  {
    url: 'http://localhost:3000/blog/windshield-replacement-cost-colorado-insurance-guide',
    type: 'Blog Article',
    expectedSchemas: ['Article', 'BreadcrumbList']
  },
  {
    url: 'http://localhost:3000/vehicles/brands/honda',
    type: 'Brand Page',
    expectedSchemas: ['Service', 'BreadcrumbList']
  }
];

async function fetchSchema(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract JSON-LD scripts
    const schemaRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
    const matches = [...html.matchAll(schemaRegex)];

    if (matches.length === 0) {
      return { error: 'No schema found' };
    }

    const schemas = matches.map(match => {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        return { error: 'Invalid JSON', raw: match[1] };
      }
    });

    return schemas;
  } catch (error) {
    return { error: error.message };
  }
}

function validateSchema(schema, expectedTypes) {
  const results = {
    valid: true,
    messages: []
  };

  if (schema['@context'] !== 'https://schema.org') {
    results.valid = false;
    results.messages.push('❌ Missing or invalid @context');
  }

  if (schema['@graph']) {
    // Combined schema with @graph
    const types = schema['@graph'].map(item => item['@type']);
    const missing = expectedTypes.filter(type => !types.includes(type));

    if (missing.length > 0) {
      results.valid = false;
      results.messages.push(`❌ Missing schema types: ${missing.join(', ')}`);
    } else {
      results.messages.push(`✓ All expected schemas present: ${types.join(', ')}`);
    }
  } else {
    // Single schema
    if (!expectedTypes.includes(schema['@type'])) {
      results.valid = false;
      results.messages.push(`❌ Unexpected schema type: ${schema['@type']}`);
    } else {
      results.messages.push(`✓ Schema type correct: ${schema['@type']}`);
    }
  }

  return results;
}

async function main() {
  console.log('🔍 Pink Auto Glass - Schema Validation Report\n');
  console.log('=' . repeat(60));

  for (const page of pages) {
    console.log(`\n📄 ${page.type}`);
    console.log(`URL: ${page.url}`);
    console.log('-'.repeat(60));

    const schemas = await fetchSchema(page.url);

    if (schemas.error) {
      console.log(`❌ Error: ${schemas.error}`);
      continue;
    }

    schemas.forEach((schema, index) => {
      if (schema.error) {
        console.log(`❌ Schema ${index + 1}: ${schema.error}`);
        return;
      }

      const validation = validateSchema(schema, page.expectedSchemas);
      validation.messages.forEach(msg => console.log(`   ${msg}`));
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Schema validation complete\n');
}

main().catch(console.error);
