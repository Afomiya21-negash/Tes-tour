// Performance Testing Script
// Run with: node scripts/performance-test.js

const http = require('http');
const https = require('https');

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PerformanceTester/1.0'
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const startTime = Date.now();
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            duration: duration,
            success: res.statusCode >= 200 && res.statusCode < 300,
            path: path,
            method: method
          });
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          statusCode: 0,
          duration: duration,
          success: false,
          error: error.message,
          path: path,
          method: method
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async runConcurrentTest(path, concurrentUsers, requestsPerUser = 5) {
    console.log(`\n🚀 Testing ${path} with ${concurrentUsers} concurrent users (${requestsPerUser} requests each)`);
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    const promises = [];
    
    // Create concurrent users
    for (let user = 0; user < concurrentUsers; user++) {
      for (let req = 0; req < requestsPerUser; req++) {
        promises.push(this.makeRequest(path));
      }
    }
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    // Calculate statistics
    const totalRequests = results.length;
    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const durations = results.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    const totalTestTime = endTime - startTime;
    const requestsPerSecond = (totalRequests / totalTestTime) * 1000;
    
    // Count responses by status code
    const statusCodes = {};
    results.forEach(r => {
      statusCodes[r.statusCode] = (statusCodes[r.statusCode] || 0) + 1;
    });
    
    const testResult = {
      path,
      concurrentUsers,
      requestsPerUser,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: (successfulRequests / totalRequests) * 100,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      totalTestTime,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      statusCodes
    };
    
    this.results.push(testResult);
    this.printTestResult(testResult);
    
    return testResult;
  }

  printTestResult(result) {
    console.log(`📊 Results for ${result.path}:`);
    console.log(`   Total Requests: ${result.totalRequests}`);
    console.log(`   Successful: ${result.successfulRequests} (${result.successRate.toFixed(1)}%)`);
    console.log(`   Failed: ${result.failedRequests}`);
    console.log(`   Average Response Time: ${result.avgDuration}ms`);
    console.log(`   Max Response Time: ${result.maxDuration}ms`);
    console.log(`   Min Response Time: ${result.minDuration}ms`);
    console.log(`   Requests/Second: ${result.requestsPerSecond}`);
    console.log(`   Status Codes:`, result.statusCodes);
    
    // Performance warnings
    if (result.avgDuration > 2000) {
      console.log(`   ⚠️  SLOW: Average response time > 2s`);
    }
    if (result.successRate < 95) {
      console.log(`   ⚠️  HIGH FAILURE RATE: ${result.failedRequests} failed requests`);
    }
    if (result.requestsPerSecond < 10) {
      console.log(`   ⚠️  LOW THROUGHPUT: Only ${result.requestsPerSecond} requests/second`);
    }
  }

  async runFullPerformanceTest() {
    console.log('🎯 Starting Performance Test Suite');
    console.log('==================================');
    
    // Test different endpoints with increasing load
    const testCases = [
      { path: '/api/tours', users: 5, requests: 3 },
      { path: '/api/tours', users: 10, requests: 3 },
      { path: '/api/tours', users: 20, requests: 2 },
      { path: '/api/vehicles', users: 5, requests: 3 },
      { path: '/api/vehicles', users: 10, requests: 3 },
      { path: '/', users: 10, requests: 2 }, // Homepage
    ];
    
    for (const testCase of testCases) {
      await this.runConcurrentTest(testCase.path, testCase.users, testCase.requests);
      
      // Wait 2 seconds between tests to let the system recover
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📈 PERFORMANCE TEST SUMMARY');
    console.log('============================');
    
    const totalTests = this.results.length;
    const avgSuccessRate = this.results.reduce((sum, r) => sum + r.successRate, 0) / totalTests;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.avgDuration, 0) / totalTests;
    const maxResponseTime = Math.max(...this.results.map(r => r.maxDuration));
    const totalRequests = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalFailures = this.results.reduce((sum, r) => sum + r.failedRequests, 0);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Total Failures: ${totalFailures}`);
    console.log(`Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
    console.log(`Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`Maximum Response Time: ${maxResponseTime}ms`);
    
    // Overall assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT:');
    if (avgResponseTime < 1000 && avgSuccessRate > 95) {
      console.log('✅ EXCELLENT: System performs well under load');
    } else if (avgResponseTime < 2000 && avgSuccessRate > 90) {
      console.log('✅ GOOD: System handles load adequately');
    } else if (avgResponseTime < 5000 && avgSuccessRate > 80) {
      console.log('⚠️  FAIR: System shows signs of stress under load');
    } else {
      console.log('❌ POOR: System struggles under load - optimization needed');
    }
    
    // Capacity estimate
    const estimatedCapacity = this.estimateCapacity();
    console.log(`\n📊 ESTIMATED CAPACITY: ${estimatedCapacity.concurrent} concurrent users`);
    console.log(`   Daily Users: ${estimatedCapacity.daily}`);
  }

  estimateCapacity() {
    // Find the highest successful test
    const successfulTests = this.results.filter(r => r.successRate > 90 && r.avgDuration < 3000);
    
    if (successfulTests.length === 0) {
      return { concurrent: 2, daily: 20 };
    }
    
    const bestTest = successfulTests.reduce((best, current) => 
      current.concurrentUsers > best.concurrentUsers ? current : best
    );
    
    return {
      concurrent: bestTest.concurrentUsers,
      daily: bestTest.concurrentUsers * 10 // Rough estimate
    };
  }
}

// Run the performance test
async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.runFullPerformanceTest();
  } catch (error) {
    console.error('Performance test failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PerformanceTester;
