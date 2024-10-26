const CompanyScraper = require('./scraper');

async function main() {
  const scraper = new CompanyScraper();
  
  console.log('Starting to scrape Clutch.co for Texas trucking companies...');
  
  try {
    const companies = await scraper.scrapeCompanies();
    console.log(`\nFound ${companies.length} companies`);
    
    // Display results in console
    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   Location: ${company.location}`);
      console.log(`   Rating: ${company.rating}`);
      console.log(`   Reviews: ${company.reviewCount}`);
      console.log(`   Project Size: ${company.minProjectSize}`);
      console.log(`   Rate: ${company.hourlyRate}`);
      console.log(`   Employees: ${company.employeeCount}`);
    });

    // Save to CSV
    scraper.saveToCSV();
    
  } catch (error) {
    console.error('Scraping failed:', error.message);
  }
}

main();