import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowRight } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordDialog = ({ open, onClose, onSuccess }: PasswordDialogProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    // Simple password check - in real app this would be more secure
    if (password === "1234") {
      onSuccess();
      setPassword("");
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-card p-10 rounded-xl">
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">ENTER PASSWORD</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 text-center text-2xl py-6"
            placeholder="- - - -"
            maxLength={4}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            className="bg-info hover:bg-info/90 text-white rounded-full p-6"
            size="lg"
          >
            <ArrowRight className="w-7 h-7" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;