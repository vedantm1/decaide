import { MainLayout } from '@/components/layout/MainLayout';
import { EnhancedRoleplayGenerator } from '@/components/roleplay/enhanced-roleplay-generator';
import { motion } from 'framer-motion';

export function RoleplayPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EnhancedRoleplayGenerator />
        </motion.div>
      </div>
    </MainLayout>
  );
}