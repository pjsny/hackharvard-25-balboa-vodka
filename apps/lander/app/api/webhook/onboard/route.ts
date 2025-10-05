import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { securityPairs, users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// Define the expected webhook schema
interface WebhookPayload {
  answer: string;
  question: string;
}

interface WebhookBody {
  user_id: string;
  payload: WebhookPayload;
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookBody = await request.json();
    console.log('Webhook body:', JSON.stringify(body, null, 2));
    
    // Validate the webhook schema
    if (!body.user_id || typeof body.user_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid user_id' }, { status: 400 });
    }
    
    if (!body.payload || typeof body.payload !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid payload' }, { status: 400 });
    }
    
    if (!body.payload.answer || typeof body.payload.answer !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid answer in payload' }, { status: 400 });
    }
    
    if (!body.payload.question || typeof body.payload.question !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid question in payload' }, { status: 400 });
    }
    
    // Insert new security pair into database
    const newSecurityPair = await db.insert(securityPairs).values({
      userId: body.user_id,
      question: body.payload.question,
      answer: body.payload.answer,
    }).returning();
    
    console.log('Inserted security pair:', newSecurityPair);
    
    // Update user's isOnboarded status to true
    const updatedUser = await db.update(users)
      .set({ isOnboarded: true })
      .where(eq(users.id, body.user_id))
      .returning();
    
    console.log('Updated user onboarding status:', updatedUser);
    
    return NextResponse.json({ 
      success: true, 
      securityPairId: newSecurityPair[0]?.id,
      userOnboarded: true
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Invalid JSON or database error' }, { status: 400 });
  }
}
