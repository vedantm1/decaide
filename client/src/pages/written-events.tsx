import { MainLayout } from '@/components/layout/MainLayout';
import { EnhancedWrittenEventGenerator } from '@/components/written-events/enhanced-written-event-generator';
import { motion } from 'framer-motion';

export function WrittenEventsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EnhancedWrittenEventGenerator />
        </motion.div>
      </div>
    </MainLayout>
  );
}