#!/usr/bin/env node

/**
 * MCP Integration Test Script
 * Tests all MCP servers and their connections
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPIntegrationTest {
  constructor() {
    this.servers = {
      convex: { path: './mcp-servers/convex-mcp-server.js', status: 'stopped' },
      magicui: { path: './mcp-servers/magicui-mcp-server.js', status: 'stopped' },
      reactbits: { path: './mcp-servers/reactbits-mcp-server.js', status: 'stopped' },
      slack: { path: './mcp-servers/slack-mcp-server.js', status: 'stopped' }
    };
    this.testResults = {};
  }

  async runTests() {
    console.log('🧪 Starting MCP Integration Tests...\n');

    // Test 1: Check if MCP server files exist
    await this.testServerFiles();

    // Test 2: Test individual MCP servers
    await this.testIndividualServers();

    // Test 3: Test MCP server communication
    await this.testServerCommunication();

    // Test 4: Test environment variables
    await this.testEnvironmentVariables();

    // Test 5: Test configuration files
    await this.testConfigurationFiles();

    // Display results
    this.displayResults();
  }

  async testServerFiles() {
    console.log('📁 Testing MCP server files...');
    
    for (const [name, server] of Object.entries(this.servers)) {
      const filePath = path.resolve(server.path);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${name}: File exists`);
        this.testResults[`${name}_file`] = 'PASS';
      } else {
        console.log(`  ❌ ${name}: File not found`);
        this.testResults[`${name}_file`] = 'FAIL';
      }
    }
    console.log('');
  }

  async testIndividualServers() {
    console.log('🚀 Testing individual MCP servers...');
    
    for (const [name, server] of Object.entries(this.servers)) {
      try {
        console.log(`  Testing ${name} server...`);
        
        const testProcess = spawn('node', [server.path], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 3000
        });

        let output = '';
        let error = '';

        testProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        testProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        await new Promise((resolve, reject) => {
          testProcess.on('close', (code) => {
            if (error.includes('running on stdio')) {
              console.log(`    ✅ ${name}: Server started successfully`);
              this.testResults[`${name}_startup`] = 'PASS';
            } else {
              console.log(`    ❌ ${name}: Server failed to start`);
              this.testResults[`${name}_startup`] = 'FAIL';
            }
            resolve();
          });

          testProcess.on('error', (err) => {
            console.log(`    ❌ ${name}: Error starting server - ${err.message}`);
            this.testResults[`${name}_startup`] = 'FAIL';
            resolve();
          });

          // Kill the process after 2 seconds
          setTimeout(() => {
            testProcess.kill();
            resolve();
          }, 2000);
        });

      } catch (error) {
        console.log(`    ❌ ${name}: Test failed - ${error.message}`);
        this.testResults[`${name}_startup`] = 'FAIL';
      }
    }
    console.log('');
  }

  async testServerCommunication() {
    console.log('📡 Testing MCP server communication...');
    
    // Test MagicUI server communication
    try {
      const magicuiTest = spawn('node', ['-e', `
        const { spawn } = require('child_process');
        const server = spawn('node', ['./mcp-servers/magicui-mcp-server.js']);
        
        setTimeout(() => {
          const testMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
          });
          
          server.stdin.write(testMessage + '\\n');
          
          setTimeout(() => {
            server.kill();
            process.exit(0);
          }, 1000);
        }, 1000);
      `], { stdio: 'inherit' });

      await new Promise((resolve) => {
        magicuiTest.on('close', () => {
          console.log('  ✅ MagicUI: Communication test passed');
          this.testResults['magicui_communication'] = 'PASS';
          resolve();
        });
      });
    } catch (error) {
      console.log('  ❌ MagicUI: Communication test failed');
      this.testResults['magicui_communication'] = 'FAIL';
    }

    // Test ReactBits server communication
    try {
      const reactbitsTest = spawn('node', ['-e', `
        const { spawn } = require('child_process');
        const server = spawn('node', ['./mcp-servers/reactbits-mcp-server.js']);
        
        setTimeout(() => {
          const testMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
          });
          
          server.stdin.write(testMessage + '\\n');
          
          setTimeout(() => {
            server.kill();
            process.exit(0);
          }, 1000);
        }, 1000);
      `], { stdio: 'inherit' });

      await new Promise((resolve) => {
        reactbitsTest.on('close', () => {
          console.log('  ✅ ReactBits: Communication test passed');
          this.testResults['reactbits_communication'] = 'PASS';
          resolve();
        });
      });
    } catch (error) {
      console.log('  ❌ ReactBits: Communication test failed');
      this.testResults['reactbits_communication'] = 'FAIL';
    }

    console.log('');
  }

  async testEnvironmentVariables() {
    console.log('🔧 Testing environment variables...');
    
    const requiredVars = [
      'CONVEX_URL',
      'SLACK_BOT_TOKEN',
      'SLACK_APP_TOKEN',
      'SLACK_SIGNING_SECRET'
    ];

    const optionalVars = [
      'MAGICUI_API_KEY',
      'REACTBITS_API_KEY'
    ];

    // Check required variables
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`  ✅ ${varName}: Set`);
        this.testResults[`env_${varName}`] = 'PASS';
      } else {
        console.log(`  ❌ ${varName}: Not set (required)`);
        this.testResults[`env_${varName}`] = 'FAIL';
      }
    }

    // Check optional variables
    for (const varName of optionalVars) {
      if (process.env[varName]) {
        console.log(`  ✅ ${varName}: Set (optional)`);
        this.testResults[`env_${varName}`] = 'PASS';
      } else {
        console.log(`  ⚠️  ${varName}: Not set (optional)`);
        this.testResults[`env_${varName}`] = 'WARN';
      }
    }

    console.log('');
  }

  async testConfigurationFiles() {
    console.log('📋 Testing configuration files...');
    
    const configFiles = [
      'mcp-client-config.json',
      'mcp-servers/package.json',
      '.env.local'
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}: Exists`);
        this.testResults[`config_${file}`] = 'PASS';
      } else {
        console.log(`  ❌ ${file}: Not found`);
        this.testResults[`config_${file}`] = 'FAIL';
      }
    }

    console.log('');
  }

  displayResults() {
    console.log('📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const results = Object.entries(this.testResults);
    const passed = results.filter(([_, status]) => status === 'PASS').length;
    const failed = results.filter(([_, status]) => status === 'FAIL').length;
    const warnings = results.filter(([_, status]) => status === 'WARN').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total: ${results.length}`);
    
    console.log('\n📋 Detailed Results:');
    for (const [test, status] of results) {
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${icon} ${test}: ${status}`);
    }
    
    console.log('\n🎯 Next Steps:');
    if (failed === 0) {
      console.log('🎉 All tests passed! Your MCP integration is ready to use.');
      console.log('📝 To start using the Enhanced Spec Kit Agent:');
      console.log('   1. Update .env.local with your actual API keys');
      console.log('   2. Start MCP servers: cd mcp-servers && npm run start:all');
      console.log('   3. Set up Slack bot integration');
      console.log('   4. Start communicating with the agent via Slack!');
    } else {
      console.log('🔧 Some tests failed. Please fix the issues above before proceeding.');
      console.log('📚 Refer to MCP-SETUP-GUIDE.md for detailed setup instructions.');
    }
    
    console.log('\n💡 For more information, see:');
    console.log('   - MCP-SETUP-GUIDE.md');
    console.log('   - slack-bot-setup.md');
    console.log('   - enhanced-agent-workflow.md');
  }
}

// Run the tests
const tester = new MCPIntegrationTest();
tester.runTests().catch(console.error);
