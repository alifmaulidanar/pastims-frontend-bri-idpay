import { Profile } from '@/types';
import { getProfile } from './lib/actions';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const UserProfile = () => {
  const user = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const user_id = user.id;
        const data = await getProfile(user_id);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!profile) {
    return <p>No profile found</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="text-center">
            <p className="text-xl font-semibold">{profile.username}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="font-medium">User ID</p>
              <p>{profile.user_id}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-medium">Username</p>
              <p>{profile.username}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-medium">Email</p>
              <p>{profile.email}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-medium">Phone</p>
              <p>{profile.phone || 'N/A'}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-medium">Role</p>
              <p>{profile.role}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-medium">Registered On</p>
              <p>{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-medium">Last Updated</p>
              <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-500">User Profile Information</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile;
