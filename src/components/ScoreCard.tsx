import { levels } from '../lib/data'
import { getCurrentLevel, getProgressToNextLevel } from '../lib/utils'

interface ProfileScore {
  id: string
  name: string
  avatar: string | null
  score: number
}

interface ScoreCardProps {
  score: number
  showIndividual?: boolean
  profiles?: ProfileScore[]
}

function ScoreCard({ score, showIndividual = false, profiles = [] }: ScoreCardProps) {
  const currentLevel = getCurrentLevel(score, levels)
  const { progress, pointsToNext } = getProgressToNextLevel(score, levels)
  const levelIndex = levels.indexOf(currentLevel)

  const colors = [
    { bg: 'from-peach-400 to-coral-400', score: 'text-rose-600' },
    { bg: 'from-coral-400 to-rose-400', score: 'text-purple-600' },
  ]

  return (
    <div className="card animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 text-lg">Relationship Score</h3>
        <span className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          Level {levelIndex + 1}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">{currentLevel.name}</span>
          <span className="font-bold text-gray-800">{score} / {currentLevel.max_points === Infinity ? '∞' : currentLevel.max_points} points</span>
        </div>
        <div className="w-full bg-background-secondary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-peach-400 to-coral-400 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500">{pointsToNext} points until next level</p>

      {showIndividual && profiles.length > 0 && (
        <div className="mt-6 pt-6 border-t border-soft space-y-3">
          {profiles.map((profile, i) => (
            <div key={profile.id} className="flex justify-between items-center p-4 bg-background-secondary rounded-2xl">
              <div className="flex items-center gap-3">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 bg-gradient-to-br ${colors[i % 2].bg} rounded-full flex items-center justify-center text-white font-bold`}>
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-gray-700">{profile.name}</span>
              </div>
              <span className={`font-bold text-lg ${colors[i % 2].score}`}>{profile.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ScoreCard
