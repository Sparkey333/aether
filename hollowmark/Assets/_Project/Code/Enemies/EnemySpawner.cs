using System;
using System.Collections;
using System.Collections.Generic;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Enemies
{
    /// Arena wave spawner. Spawns Rend units at child transforms (or in a
    /// ring around itself), waits for each wave to die, announces progress.
    public class EnemySpawner : MonoBehaviour
    {
        [Serializable]
        public class Wave
        {
            public int grunts = 3;
            public int spitters = 0;
            public float spawnInterval = 0.8f;
        }

        [SerializeField]
        private List<Wave> waves = new List<Wave>
        {
            new Wave { grunts = 3, spitters = 0 },
            new Wave { grunts = 3, spitters = 1 },
        };

        [SerializeField, Tooltip("Start automatically when the player gets this close. 0 = manual StartWaves() only.")]
        private float autoStartRadius = 12f;

        private readonly List<Health> alive = new List<Health>();
        private Transform player;
        private bool started;

        public event Action<int> WaveStarted;
        public event Action AllCleared;

        private void OnEnable()
        {
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
        }

        private void OnDisable()
        {
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
        }

        private void HandlePlayerSpawned(GameObject playerGo)
        {
            if (playerGo != null) player = playerGo.transform;
        }

        private void Update()
        {
            if (started || autoStartRadius <= 0f || player == null) return;
            if (Vector3.Distance(transform.position, player.position) <= autoStartRadius)
                StartWaves();
        }

        public void StartWaves()
        {
            if (started) return;
            started = true;
            StartCoroutine(RunWaves());
        }

        private IEnumerator RunWaves()
        {
            for (int waveIndex = 0; waveIndex < waves.Count; waveIndex++)
            {
                Wave wave = waves[waveIndex];
                GameEvents.RaiseAnnounce($"WAVE {waveIndex + 1}");
                WaveStarted?.Invoke(waveIndex + 1);

                for (int i = 0; i < wave.grunts; i++)
                {
                    Track(RendGrunt.Spawn(NextSpawnPoint(i)));
                    yield return new WaitForSeconds(wave.spawnInterval);
                }
                for (int i = 0; i < wave.spitters; i++)
                {
                    Track(RendSpitter.Spawn(NextSpawnPoint(wave.grunts + i)));
                    yield return new WaitForSeconds(wave.spawnInterval);
                }

                while (AnyAlive())
                    yield return new WaitForSeconds(0.5f);
            }

            GameEvents.RaiseAnnounce("ARENA CLEAR");
            AllCleared?.Invoke();
        }

        private void Track(Component unit)
        {
            if (unit == null) return;
            var health = unit.GetComponent<Health>();
            if (health != null) alive.Add(health);
        }

        private bool AnyAlive()
        {
            for (int i = alive.Count - 1; i >= 0; i--)
            {
                if (alive[i] == null || alive[i].IsDead)
                    alive.RemoveAt(i);
            }
            return alive.Count > 0;
        }

        private Vector3 NextSpawnPoint(int index)
        {
            if (transform.childCount > 0)
            {
                Transform point = transform.GetChild(index % transform.childCount);
                return point.position;
            }
            float angle = index * 137f * Mathf.Deg2Rad; // golden-ish scatter
            return transform.position + new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)) * 6f;
        }
    }
}
