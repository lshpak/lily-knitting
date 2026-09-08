import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  projects: 'lily-projects',
  finished: 'lily-finished',
  yarns: 'lily-yarns',
  pastYarns: 'lily-yarns-past',
  patterns: 'lily-patterns',
  tab: 'lily-tab',
}

const DEFAULTS = {
  projects: [],
  finished: [],
  yarns: [],
  pastYarns: [],
  patterns: [],
  tab: 'wips',
}

function readLocal() {
  const data = {}
  for (const [field, key] of Object.entries(STORAGE_KEYS)) {
    try {
      const stored = localStorage.getItem(key)
      data[field] = stored ? JSON.parse(stored) : DEFAULTS[field]
    } catch {
      data[field] = DEFAULTS[field]
    }
  }
  return data
}

function writeLocal(data) {
  for (const [field, key] of Object.entries(STORAGE_KEYS)) {
    if (data[field] !== undefined) {
      localStorage.setItem(key, JSON.stringify(data[field]))
    }
  }
}

function hasLocalData() {
  return Object.values(STORAGE_KEYS).some(key => {
    const val = localStorage.getItem(key)
    if (!val) return false
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed.length > 0 : parsed !== DEFAULTS.tab
    } catch {
      return false
    }
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)
  const dataRef = useRef(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setData(readLocal())
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const userDoc = doc(db, 'users', user.uid)
    getDoc(userDoc).then((snap) => {
      if (snap.exists()) {
        const cloudData = snap.data()
        if (hasLocalData()) {
          const local = readLocal()
          const localHasMore = Object.keys(DEFAULTS).some(k =>
            Array.isArray(local[k]) && local[k].length > (cloudData[k]?.length || 0)
          )
          if (localHasMore) {
            const merged = {}
            for (const k of Object.keys(DEFAULTS)) {
              if (Array.isArray(DEFAULTS[k])) {
                const cloudIds = new Set((cloudData[k] || []).map(i => i.id))
                const extras = (local[k] || []).filter(i => !cloudIds.has(i.id))
                merged[k] = [...(cloudData[k] || []), ...extras]
              } else {
                merged[k] = cloudData[k] ?? local[k]
              }
            }
            setData(merged)
            writeLocal(merged)
            setDoc(userDoc, merged, { merge: true })
          } else {
            setData(cloudData)
            writeLocal(cloudData)
          }
        } else {
          setData(cloudData)
          writeLocal(cloudData)
        }
      } else {
        const local = readLocal()
        setData(local)
        setDoc(userDoc, local)
      }
      setLoading(false)
    })
  }, [user])

  dataRef.current = data

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const next = { ...prev, [field]: value }
      writeLocal({ [field]: value })
      return next
    })

    if (user) {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const current = dataRef.current
        if (current) {
          setDoc(doc(db, 'users', user.uid), current, { merge: true })
        }
      }, 500)
    }
  }, [user])

  async function handleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('Sign in failed: ' + err.message)
      }
    }
  }

  async function handleSignOut() {
    await signOut(auth)
    setData(readLocal())
  }

  const value = {
    user: user ?? null,
    loading,
    data,
    updateData,
    signIn: handleSignIn,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
