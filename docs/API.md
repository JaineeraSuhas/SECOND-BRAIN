# API Documentation

## Overview

Second Brain AI uses Supabase for backend services. All API interactions are handled through the Supabase JavaScript client.

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});
```

### Sign In with Google
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## Documents

### List Documents
```typescript
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get Single Document
```typescript
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('id', documentId)
  .single();
```

### Create Document
```typescript
const { data, error } = await supabase
  .from('documents')
  .insert({
    title: 'My Document',
    content: 'Document content...',
    file_type: 'text/plain',
    status: 'pending'
  })
  .select()
  .single();
```

### Update Document
```typescript
const { data, error } = await supabase
  .from('documents')
  .update({ 
    title: 'Updated Title',
    status: 'completed'
  })
  .eq('id', documentId)
  .select()
  .single();
```

### Delete Document
```typescript
const { error } = await supabase
  .from('documents')
  .delete()
  .eq('id', documentId);
```

## File Storage

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${userId}/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get File URL
```typescript
const { data } = supabase.storage
  .from('documents')
  .getPublicUrl(`${userId}/${filename}`);
```

### Download File
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .download(`${userId}/${filename}`);
```

### Delete File
```typescript
const { error } = await supabase.storage
  .from('documents')
  .remove([`${userId}/${filename}`]);
```

## Knowledge Graph

### Get All Nodes
```typescript
const { data, error } = await supabase
  .from('nodes')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get All Edges
```typescript
const { data, error } = await supabase
  .from('edges')
  .select('*')
  .order('created_at', { ascending: false });
```

### Create Node
```typescript
const { data, error } = await supabase
  .from('nodes')
  .insert({
    type: 'concept',
    label: 'Machine Learning',
    properties: { description: 'AI field...' }
  })
  .select()
  .single();
```

### Create Edge
```typescript
const { data, error } = await supabase
  .from('edges')
  .insert({
    source_id: sourceNodeId,
    target_id: targetNodeId,
    type: 'relates_to',
    weight: 1.0
  })
  .select()
  .single();
```

## Chat Messages

### Get Chat History
```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
  .order('created_at', { ascending: true })
  .limit(50);
```

### Save Message
```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .insert({
    role: 'user',
    content: 'What is machine learning?',
    sources: []
  })
  .select()
  .single();
```

## Google Gemini Integration

### Extract Concepts
```typescript
import { extractConcepts } from './lib/gemini';

const result = await extractConcepts(documentText);
// Returns: { concepts, entities, relationships }
```

### Generate Answer (RAG)
```typescript
import { generateAnswer } from './lib/gemini';

const response = await generateAnswer(question, relevantChunks);
// Returns: { answer, confidence }
```

### Generate Embeddings
```typescript
import { generateEmbedding } from './lib/gemini';

const embedding = await generateEmbedding(text);
// Returns: number[] (768-dimensional vector)
```

## Real-time Subscriptions

### Subscribe to Documents
```typescript
const subscription = supabase
  .channel('documents')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'documents' 
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Subscribe to Graph Changes
```typescript
const subscription = supabase
  .channel('graph')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'nodes' },
    handleNodeChange
  )
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'edges' },
    handleEdgeChange
  )
  .subscribe();
```

## Error Handling

All Supabase operations return `{ data, error }`. Always check for errors:

```typescript
const { data, error } = await supabase.from('documents').select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
  return;
}

// Use data safely
console.log(data);
```

## Rate Limits

### Supabase
- **Free tier**: 500MB database, 1GB storage, 2GB bandwidth/month
- **API requests**: Unlimited

### Google Gemini
- **Free tier**: 1,500 requests/day
- **Rate limit**: 60 requests/minute

## Best Practices

1. **Always handle errors** - Check `error` before using `data`
2. **Use TypeScript types** - Import types from `src/types`
3. **Implement retry logic** - For network failures
4. **Cache responses** - Use React Query for caching
5. **Batch operations** - Reduce API calls where possible
6. **Use RLS** - Rely on Row Level Security for authorization

---

**Last Updated**: January 2026
