const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { Parser } = require('json2csv');

class CompanyScraper {
  constructor() {
    this.baseUrl = 'https://clutch.co/logistics/trucking-companies/texas';
    this.companies = [];
  }

  async fetchPage(pageNum = 0) {
    try {
      const url = pageNum === 0 ? this.baseUrl : `${this.baseUrl}?page=${pageNum}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch page ${pageNum}:`, error.message);
      return null;
    }
  }

  parseCompany($, element) {
    const company = {
      name: $(element).find('h3.company_info').text().trim(),
      location: $(element).find('.location-city').text().trim(),
      rating: $(element).find('.rating').text().trim(),
      reviewCount: $(element).find('.reviews-link').text().trim(),
      minProjectSize: $(element).find('.list-item.custom_popover').first().text().trim(),
      hourlyRate: $(element).find('.list-item.custom_popover').eq(1).text().trim(),
      employeeCount: $(element).find('.list-item.custom_popover').eq(2).text().trim()
    };
    return company;
  }

  async scrapeCompanies() {
    let pageNum = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      console.log(`Scraping page ${pageNum + 1}...`);
      const html = await this.fetchPage(pageNum);
      
      if (!html) {
        break;
      }

      const $ = cheerio.load(html);
      const companyElements = $('.provider-row');

      if (companyElements.length === 0) {
        hasNextPage = false;
        continue;
      }

      companyElements.each((_, element) => {
        const company = this.parseCompany($, element);
        this.companies.push(company);
      });

      pageNum++;
      // Add a delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return this.companies;
  }

  saveToCSV() {
    try {
      const parser = new Parser();
      const csv = parser.parse(this.companies);
      fs.writeFileSync('texas_trucking_companies.csv', csv);
      console.log('Data saved to texas_trucking_companies.csv');
    } catch (error) {
      console.error('Error saving to CSV:', error.message);
    }
  }
}

module.exports = CompanyScraper;