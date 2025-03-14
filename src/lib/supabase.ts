
import { supabase } from "@/integrations/supabase/client";

// Authentication helpers
export const signUp = async (email: string, password: string, username: string) => {
  // Register the user with Supabase auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  
  if (authError) {
    console.error("Signup auth error:", authError);
    return { data: null, error: authError };
  }
  
  console.log("Auth signup response:", authData);
  
  // Create profile after successful registration
  if (authData.user) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          full_name: username,
        });
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
        return { data: authData, error: { message: "User created but error setting up profile" } };
      }
    } catch (e) {
      console.error("Exception during profile creation:", e);
    }
  }
  
  return { data: authData, error: null };
};

export const signIn = async (email: string, password: string) => {
  console.log("Attempting to sign in with:", email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error("Sign in error:", error);
  } else {
    console.log("Sign in successful:", data);
  }
  
  return { data, error };
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return supabase.auth.getUser();
};

// Spot related functions
export const saveSpot = async (spotData: {
  message: string;
  location: { latitude: number; longitude: number };
  radius: number;
  duration: number;
  recipients: string[];
}) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { data: null, error: userError || { message: "User not authenticated" } };
  }

  // Calculate expiration date based on duration
  const expiresAt = new Date();
  if (spotData.duration === 999999) {
    // 10 years (essentially forever)
    expiresAt.setFullYear(expiresAt.getFullYear() + 10);
  } else {
    // Convert hours to milliseconds
    expiresAt.setTime(expiresAt.getTime() + (spotData.duration * 60 * 60 * 1000));
  }

  // Convert duration to Postgres interval
  let durationInterval = `${spotData.duration} hours`;
  if (spotData.duration === 999999) {
    durationInterval = '10 years'; // Essentially forever
  }

  // Insert the spot
  const { data: spot, error: spotError } = await supabase
    .from('spots')
    .insert({
      creator_id: userData.user.id,
      message: spotData.message,
      latitude: spotData.location.latitude,
      longitude: spotData.location.longitude,
      radius: spotData.radius,
      duration: durationInterval,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();
  
  if (spotError) {
    console.error("Error creating spot:", spotError);
    return { data: null, error: spotError };
  }
  
  // Add recipients
  if (spotData.recipients.length > 0) {
    const recipientRecords = spotData.recipients.map(recipientId => ({
      spot_id: spot.id,
      recipient_id: recipientId
    }));
    
    const { error: recipientError } = await supabase
      .from('spot_recipients')
      .insert(recipientRecords);
    
    if (recipientError) {
      console.error("Error adding recipients:", recipientError);
      return { data: spot, error: { message: "Spot created but error adding recipients" } };
    }
  }
  
  return { data: spot, error: null };
};

export const getSpots = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { data: null, error: userError || { message: "User not authenticated" } };
  }

  // Get spots created by the user
  const { data: mySpots, error: mySpotsError } = await supabase
    .from('spots')
    .select(`
      id,
      creator_id,
      message,
      latitude,
      longitude,
      radius,
      duration,
      created_at,
      expires_at
    `)
    .eq('creator_id', userData.user.id)
    .gte('expires_at', new Date().toISOString());
  
  if (mySpotsError) {
    console.error("Error fetching user's spots:", mySpotsError);
    return { data: null, error: mySpotsError };
  }

  // Get spots where user is a recipient
  const { data: recipientSpots, error: recipientSpotsError } = await supabase
    .from('spot_recipients')
    .select(`
      spot_id,
      seen_at,
      spots (
        id,
        creator_id,
        message,
        latitude,
        longitude,
        radius,
        duration,
        created_at,
        expires_at
      )
    `)
    .eq('recipient_id', userData.user.id)
    .gte('spots.expires_at', new Date().toISOString());
  
  if (recipientSpotsError) {
    console.error("Error fetching recipient spots:", recipientSpotsError);
    return { data: mySpots, error: { message: "Error fetching spots shared with you" } };
  }

  // Format the spots to match our app's Spot type
  const formatSpot = (dbSpot: any, isMySpot: boolean = false) => {
    return {
      id: dbSpot.id,
      creatorId: dbSpot.creator_id,
      message: dbSpot.message,
      location: {
        latitude: dbSpot.latitude,
        longitude: dbSpot.longitude
      },
      radius: dbSpot.radius,
      duration: typeof dbSpot.duration === 'string' ? 
        (dbSpot.duration.includes('year') ? 999999 : parseInt(dbSpot.duration)) : 
        dbSpot.duration,
      createdAt: new Date(dbSpot.created_at),
      expiresAt: new Date(dbSpot.expires_at),
      recipients: [], // We don't have this data yet, need separate query if needed
      replies: [] // Need separate query for replies if implementing
    };
  };

  const formattedMySpots = mySpots.map(spot => formatSpot(spot, true));
  
  const formattedRecipientSpots = recipientSpots
    .filter(item => item.spots) // Filter out any null spots
    .map(item => formatSpot(item.spots));

  // Combine both types of spots
  const allSpots = [...formattedMySpots, ...formattedRecipientSpots];
  
  return { data: allSpots, error: null };
};

// Friends related functions
export const getFriends = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { data: null, error: userError || { message: "User not authenticated" } };
  }

  // Get all accepted friendships where the user is involved
  const { data: friendships, error: friendshipError } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      user_id,
      friend_id,
      profiles!friendships_friend_id_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .or(`user_id.eq.${userData.user.id},friend_id.eq.${userData.user.id}`)
    .eq('status', 'accepted');
  
  if (friendshipError) {
    console.error("Error fetching friendships:", friendshipError);
    return { data: null, error: friendshipError };
  }

  // Format friends data
  const friends = friendships.map(friendship => {
    const isFriend = friendship.user_id === userData.user.id;
    const friendData = friendship.profiles;
    
    return {
      id: isFriend ? friendship.friend_id : friendship.user_id,
      name: friendData?.full_name || friendData?.username || 'Unknown',
      avatar: friendData?.avatar_url || `https://i.pravatar.cc/150?u=${friendship.id}`,
      status: 'online' // We'd need a separate online status tracking
    };
  });

  return { data: friends, error: null };
};
