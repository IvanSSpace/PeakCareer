import { Routes, Route } from 'react-router-dom'
import Header from './Header'
import HomePage from './HomePage'
import AggregatorPage from './modules/aggregator/AggregatorPage'
import ResumePage from './modules/resume/ResumePage'
import LearningPage from './modules/learning/LearningPage'
import SetupPage from './modules/setup/SetupPage'
import PipelinePage from './modules/pipeline/PipelinePage'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aggregator" element={<AggregatorPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
      </Routes>
    </div>
  )
}
