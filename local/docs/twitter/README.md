# Twitter Guidelines Documentation

This directory contains local documentation for Twitter guidelines and best practices.

## Purpose

The `TwitterGuidelineIngester` processes markdown files from this directory to create embeddings and store them in the vector database. Unlike other ingesters that download content from GitHub, this ingester reads from local files, making it perfect for:

- Custom guidelines
- Internal policies
- Curated best practices
- Community-specific rules

## Directory Structure

```
local/docs/twitter/
├── README.md                           # This file
├── twitter-guidelines.md               # Main Twitter guidelines
├── engagement-best-practices.md        # Engagement strategies
└── [your-custom-guidelines].md         # Add more files here
```

## Adding New Guidelines

1. Create a new markdown file in this directory
2. Use clear headers (# and ##) for sectioning
3. Write concise, actionable content
4. Save the file with a `.md` or `.mdx` extension

Example:

```markdown
# My Custom Twitter Policy

## Section 1

Content here...

## Section 2

More content...
```

## File Format

- **Supported formats**: `.md`, `.mdx`
- **Header levels**: Use `#` (H1) and `##` (H2) for main sections
- **Code blocks**: Use triple backticks for code examples
- **Images**: You can include images, but they won't be processed for embeddings

## Usage

The `TwitterGuidelineIngester` will automatically:

1. Scan all markdown files in this directory
2. Split content by headers
3. Create chunks with overlap for better context
4. Generate embeddings
5. Store in the vector database

## Configuration

The ingester is configured with:

- **Chunk size**: 4096 characters
- **Chunk overlap**: 512 characters
- **Base URL**: https://twitter.com/guidelines (for reference)
- **URL mapping**: Disabled (no specific URLs for local docs)

## Notes

- Files in this directory are NOT deleted during cleanup
- Add as many markdown files as needed
- Keep content relevant to Twitter guidelines and best practices
- Update existing files as guidelines evolve

## Example Files Included

1. **twitter-guidelines.md** - Official-style community guidelines
2. **engagement-best-practices.md** - Strategies for better engagement

Feel free to modify or replace these with your own content!
