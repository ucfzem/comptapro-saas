import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

function ensureEnv(): void {
  if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
    throw new Error(
      'Missing RAG environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY'
    );
  }
}

function getVectorStore() {
  ensureEnv();
  const sbClient = createClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false },
  });

  return new SupabaseVectorStore(new OpenAIEmbeddings(), {
    client: sbClient,
    tableName: 'documents',
    queryName: 'match_documents',
  });
}

function getLLM() {
  return new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0.1,
    apiKey: openaiApiKey,
  });
}

const RAG_PROMPT = PromptTemplate.fromTemplate(`
Tu es un assistant comptable expert. Réponds à la question en français en
utilisant uniquement le contexte fourni ci-dessous.

Contexte :
{context}

Question : {question}

Réponse :`);

export type RAGResult = {
  answer: string;
  sources: { pageContent: string; metadata: Record<string, unknown> }[];
};

export async function askRAG(question: string): Promise<RAGResult> {
  const vectorStore = getVectorStore();
  const llm = getLLM();

  const retriever = vectorStore.asRetriever(4);

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    RAG_PROMPT,
    llm,
    new StringOutputParser(),
  ]);

  const docs = await retriever.invoke(question);
  const answer = await chain.invoke(question);

  return {
    answer,
    sources: docs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata as Record<string, unknown>,
    })),
  };
}
