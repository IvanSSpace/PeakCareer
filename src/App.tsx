import { Routes, Route } from 'react-router-dom'
import Header from './Header'
import HomePage from './HomePage'
import AggregatorPage from './modules/aggregator/AggregatorPage'
import AggregatorPlanPage from './modules/aggregator/AggregatorPlanPage'
import ResumePage from './modules/resume/ResumePage'
import ResumePlanPage from './modules/resume/ResumePlanPage'
import LearningPage from './modules/learning/LearningPage'
import LearningPlanPage from './modules/learning/LearningPlanPage'
import SetupPage from './modules/setup/SetupPage'
import PipelinePage from './modules/pipeline/PipelinePage'
import PipelinePlanPage from './modules/pipeline/PipelinePlanPage'
import BlogPage from './modules/blog/BlogPage'
import SelectPage from './modules/select/SelectPage'

export default function App() {
  return (
    <div className="min-h-screen bg-[#F1F1EB]">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aggregator" element={<AggregatorPage />} />
        <Route path="/aggregator-plan" element={<AggregatorPlanPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume-plan" element={<ResumePlanPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/learning-plan" element={<LearningPlanPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/pipeline-plan" element={<PipelinePlanPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/select" element={<SelectPage />} />
      </Routes>
    </div>
  )
}
