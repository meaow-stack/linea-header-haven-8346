import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { mockOrders } from "@/data/mockOrders";

interface Profile {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

const emptyProfile: Profile = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  postal_code: "",
  country: "",
};

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address_line1, address_line2, city, postal_code, country")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        toast({ title: "Could not load profile", description: error.message, variant: "destructive" });
      } else if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          address_line1: data.address_line1 ?? "",
          address_line2: data.address_line2 ?? "",
          city: data.city ?? "",
          postal_code: data.postal_code ?? "",
          country: data.country ?? "",
        });
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace state={{ from: "/account" }} />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address_line1: profile.address_line1,
        address_line2: profile.address_line2,
        city: profile.city,
        postal_code: profile.postal_code,
        country: profile.country,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const update = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const statusVariant = (status: string) =>
    status === "Delivered" ? "default" : status === "Cancelled" ? "destructive" : "secondary";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-light tracking-wide">My Account</h1>
            <p className="text-sm text-muted-foreground mt-2">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Order history</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6 space-y-4">
            {mockOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-base font-light">Order {order.id}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    <p className="text-sm font-medium mt-2">{order.total}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-light">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm">{item.price}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-light">Personal details & shipping</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full name</Label>
                        <Input id="full_name" value={profile.full_name ?? ""} onChange={update("full_name")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={profile.phone ?? ""} onChange={update("phone")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_line1">Address line 1</Label>
                      <Input id="address_line1" value={profile.address_line1 ?? ""} onChange={update("address_line1")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_line2">Address line 2</Label>
                      <Input id="address_line2" value={profile.address_line2 ?? ""} onChange={update("address_line2")} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={profile.city ?? ""} onChange={update("city")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal code</Label>
                        <Input id="postal_code" value={profile.postal_code ?? ""} onChange={update("postal_code")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={profile.country ?? ""} onChange={update("country")} />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
