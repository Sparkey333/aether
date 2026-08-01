using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Player
{
    /// Binds InputReader to the motor (camera-relative), owns the
    /// death/respawn handshake, and announces the player to the world
    /// via GameEvents.PlayerSpawned.
    [RequireComponent(typeof(PlayerMotor))]
    public class PlayerController : MonoBehaviour
    {
        private PlayerMotor motor;
        private Health health;
        private InputReader input;
        private Camera cachedCamera;
        private bool dead;

        public PlayerMotor Motor => motor;

        private void Awake()
        {
            motor = GetComponent<PlayerMotor>();
            health = GetComponent<Health>();
            input = InputReader.EnsureExists();

            if (health == null)
                Debug.LogWarning("PlayerController: no Health component — the player cannot die or respawn.", this);
        }

        private void OnEnable()
        {
            if (input != null)
            {
                input.JumpPressed += HandleJumpPressed;
                input.JumpReleased += HandleJumpReleased;
                input.DashPressed += HandleDashPressed;
            }
            if (health != null)
                health.Died += HandleDied;
        }

        private void OnDisable()
        {
            if (input != null)
            {
                input.JumpPressed -= HandleJumpPressed;
                input.JumpReleased -= HandleJumpReleased;
                input.DashPressed -= HandleDashPressed;
            }
            if (health != null)
                health.Died -= HandleDied;
        }

        private void Start()
        {
            GameEvents.RaisePlayerSpawned(gameObject);
        }

        private void Update()
        {
            if (dead || input == null) return;

            Vector2 move = input.Move;
            Camera cam = GetCamera();
            Vector3 world;
            if (cam != null)
            {
                Vector3 forward = cam.transform.forward;
                forward.y = 0f;
                forward.Normalize();
                Vector3 right = cam.transform.right;
                right.y = 0f;
                right.Normalize();
                world = forward * move.y + right * move.x;
            }
            else
            {
                world = new Vector3(move.x, 0f, move.y);
            }
            motor.SetMoveInput(world);
        }

        private Camera GetCamera()
        {
            if (cachedCamera == null)
                cachedCamera = Camera.main;
            return cachedCamera;
        }

        private void HandleJumpPressed()
        {
            if (!dead) motor.OnJumpPressed();
        }

        private void HandleJumpReleased() => motor.OnJumpReleased();

        private void HandleDashPressed()
        {
            if (!dead) motor.TryDash();
        }

        private void HandleDied()
        {
            if (dead) return;
            dead = true;
            motor.MoveLocked = true;
            motor.SetMoveInput(Vector3.zero);
            GameEvents.RaisePlayerDied();
        }

        /// Called by GameManager after the death delay.
        public void Respawn(Vector3 position)
        {
            motor.Teleport(position);
            PlayerBuffs.ResetAll();
            if (health != null) health.ReviveFull();
            dead = false;
            motor.MoveLocked = false;
            GameEvents.RaisePlayerSpawned(gameObject);
        }
    }
}
