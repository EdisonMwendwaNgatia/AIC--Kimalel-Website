'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function handleMinistrySignup(prevState: any, formData: FormData) {
  const supabase = createClient();
  
  try {
    const ministry = formData.get('ministry') as string;
    const fullName = formData.get('fullName') as string;
    const parentName = formData.get('parentName') as string;
    const childName = formData.get('childName') as string;
    const childAge = formData.get('childAge') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    // Validate required fields
    if (!ministry || !email) {
      return { 
        success: false, 
        message: 'Ministry and email are required fields.' 
      };
    }

    // Prepare the data for insertion
    const signupData: any = {
      ministry_name: ministry,
      email: email,
      phone_number: phone || null,
      status: 'pending',
      additional_info: {}
    };

    // Handle different ministry form structures
    if (ministry === "Children's Ministry") {
      if (!parentName || !childName || !childAge) {
        return { 
          success: false, 
          message: 'Parent name, child name, and child age are required for Children\'s Ministry.' 
        };
      }
      signupData.parent_name = parentName;
      signupData.child_name = childName;
      signupData.child_age = parseInt(childAge);
      signupData.full_name = `${parentName} (Parent of ${childName})`;
    } else {
      if (!fullName) {
        return { 
          success: false, 
          message: 'Full name is required.' 
        };
      }
      signupData.full_name = fullName;
    }

    // Add any additional form data to additional_info
    const additionalData: any = {};
    formData.forEach((value, key) => {
      if (!['ministry', 'fullName', 'parentName', 'childName', 'childAge', 'email', 'phone'].includes(key)) {
        additionalData[key] = value;
      }
    });
    
    if (Object.keys(additionalData).length > 0) {
      signupData.additional_info = additionalData;
    }

    console.log('💾 Saving ministry signup:', {
      ministry: signupData.ministry_name,
      email: signupData.email
    });

    // Insert into ministry_signups table
    const { data, error } = await supabase
      .from('ministry_signups')
      .insert([signupData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return { 
        success: false, 
        message: 'Failed to submit signup. Please try again.' 
      };
    }

    console.log('✅ Ministry signup saved successfully. ID:', data.id);
    
    return { 
      success: true, 
      message: `Thank you for your interest in ${ministry}! We'll contact you soon.`,
      data: data
    };

  } catch (error) {
    console.error('💥 Ministry signup error:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.' 
    };
  }
}
