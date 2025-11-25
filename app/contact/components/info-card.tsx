import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

export const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  delay: number;
}> = ({ icon, title, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">{icon}</div>
        <div>
          <CardDescription className="text-gray-400">{title}</CardDescription>
          <CardTitle className="text-white text-lg">{value}</CardTitle>
        </div>
      </CardHeader>
    </Card>
  </motion.div>
);
