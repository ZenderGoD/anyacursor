# MCP Server Setup Guide

This project includes three MCP (Model Context Protocol) servers for enhanced AI-assisted development:

## 🗄️ Convex MCP Server

Convex provides MCP support for database operations and schema management.

### Configuration

The Convex MCP server is pre-configured in `mcp.json`:

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "convex", "mcp"]
    }
  }
}
```

### Usage Examples

- "Create a new table in the database"
- "Add an index to the users table"
- "Generate a query for user conversations"
- "Update the schema with new fields"

## 🚀 Magic UI MCP Server

Magic UI components are now available through MCP for seamless integration with your AI-assisted IDE.

### Installation Options

#### Option 1: CLI Installation (Recommended)

For Cursor:
```bash
npx @magicuidesign/cli@latest install cursor
```

For Windsurf:
```bash
npx @magicuidesign/cli@latest install windsurf
```

For Claude Desktop:
```bash
npx @magicuidesign/cli@latest install claude
```

For Cline:
```bash
npx @magicuidesign/cli@latest install cline
```

For Roo-Cline:
```bash
npx @magicuidesign/cli@latest install roo-cline
```

#### Option 2: Manual Configuration

Add the following to your MCP config file:

```json
{
  "mcpServers": {
    "@magicuidesign/mcp": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    }
  }
}
```

### Usage Examples

Once configured, you can ask your IDE to generate Magic UI components:

- "Add a blur fade text animation"
- "Add a grid background"
- "Add a vertical marquee of logos"
- "Create a morphing background"
- "Add animated gradients"

## ⚛️ React Bits MCP Server

React Bits provides additional animated components and effects.

### Configuration

The React Bits MCP server is pre-configured in `mcp.json`:

```json
{
  "mcpServers": {
    "react-bits-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://react-bits-mcp.davidhzdev.workers.dev/sse"]
    }
  }
}
```

### Usage Examples

- "Add animated particle effects"
- "Create a morphing loader"
- "Add interactive hover animations"
- "Generate animated card components"

## 🔧 Setup Instructions

1. **Install the Magic UI MCP package** (already installed):
   ```bash
   npm install --save-dev @magicuidesign/mcp
   ```

2. **Configure your IDE**:
   - Choose either CLI installation or manual configuration
   - Restart your IDE after configuration

3. **Start using MCP commands**:
   - Your AI assistant will now have access to all Magic UI and React Bits components
   - Generate components with natural language prompts

## 📝 Configuration Files

- `mcp.json` - Contains MCP server configurations
- `.cursor/mcp.json` - Cursor-specific MCP configuration (if using Cursor)
- IDE-specific MCP configuration files

## 🔄 Updating MCP Servers

To update the MCP servers to their latest versions:

```bash
npm update @magicuidesign/mcp
```

## 🐛 Troubleshooting

### Common Issues

1. **MCP Server Not Found**: Ensure the package is installed and your IDE is configured correctly
2. **Component Generation Fails**: Check that your IDE supports MCP and is properly configured
3. **Connection Issues**: Verify your internet connection and try restarting your IDE

### Debug Commands

```bash
# Check if Magic UI MCP is installed
npx @magicuidesign/mcp --version

# Test MCP connection
npx @magicuidesign/mcp --test
```

## 📚 Resources

- [Magic UI Documentation](https://magicui.design)
- [React Bits Documentation](https://www.reactbits.dev)
- [Model Context Protocol](https://modelcontextprotocol.com/)
- [Cursor MCP Setup](https://cursor.com/docs/mcp)
