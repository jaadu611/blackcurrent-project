import { useState } from "react";
import { User } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function ProfileCard() {
  const [formData, setFormData] = useState({
    name: "Sami Raharson",
    phone: "30274823098",
    email: "Samyraharson003@gmail.com",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving profile:", formData);
    // Handle save logic here
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-6">
            <User className="w-24 h-24 text-gray-500" />
          </div>
          <h3 className="text-gray-900 mb-2">My profile</h3>
          <p className="text-xs text-gray-400">Last Login 09 Aug 2019, 14:54</p>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-700">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm text-gray-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
