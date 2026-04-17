"use client";

import { Card, CardContent } from "../../../components/ui/card";
import { Headphones } from "lucide-react";

export default function Supports() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Support</h2>
        <p className="text-sm text-gray-600">Get help and support</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Headphones className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2">Support Center</h3>
          <p className="text-sm text-gray-600">
            Contact support or browse our help documentation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
