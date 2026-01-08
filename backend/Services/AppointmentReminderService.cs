using System.Net.Http;
using System.Text;
using System.Text.Json;
using Mapper;
using Microsoft.Extensions.Logging;


namespace Service
{
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<AppointmentReminderService> _logger;
        private const string ApiGatewayUrl = "https://btlidc7hnlr4ffmvrw2od2gviq0soefv.lambda-url.ap-southeast-2.on.aws/";

        public AppointmentReminderService(
            IHttpClientFactory httpClientFactory,
            ILogger<AppointmentReminderService> logger
        )
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[Appointment Reminder Service] Started. Checking pending reminders every 5 minutes.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var currentTime = DateTime.Now;
                    var startTime = currentTime;
                    var endTime = currentTime.AddHours(1);

                    _logger.LogInformation("=====================================");
                    _logger.LogInformation(
                        "[Detection Cycle] Start querying appointments to be reminded. Current time: {CurrentTime}",
                        currentTime.ToString("yyyy-MM-dd HH:mm:ss")
                    );

                    // Output query logic
                    _logger.LogInformation("[Query Logic] Core filter conditions to be executed (simulated SQL):");
                    _logger.LogInformation(
                        "SELECT id, user_id, doctor_id, is_accept, illness_txt, medicine, price, comment, status, date, start_time, end_time, is_reminded FROM book " +
                        "WHERE start_time BETWEEN '{StartTime}' AND '{EndTime}' " +
                        "  AND is_reminded = 'f' " +
                        "ORDER BY start_time ASC;",
                        startTime.ToString("yyyy-MM-dd HH:mm:ss"),
                        endTime.ToString("yyyy-MM-dd HH:mm:ss")
                    );

                    // 1. Query appointments that need reminders
                    var reminderBooks = BookMapper.SelectReminderAppointments();

                    _logger.LogInformation(
                        "[Query Result] Found {Count} appointment records to be reminded",
                        reminderBooks.Count
                    );

                    if (reminderBooks.Count > 0)
                    {
                        _logger.LogInformation("[Appointments to Remind]:");
                        for (int i = 0; i < reminderBooks.Count; i++)
                        {
                            var book = reminderBooks[i];
                            string isRemindedDisplay = book.IsReminded
                                ? "true (stored as 't' in DB)"
                                : "false (stored as 'f' in DB)";

                            _logger.LogInformation(
                                "  Item {Index}: ID={Id}, UserId={UserId}, DoctorId={DoctorId}, " +
                                "StartTime={StartTime}, IsReminded={IsReminded}, IllnessTxt={IllnessTxt}",
                                i + 1,
                                book.Id,
                                book.UserId,
                                book.DoctorId,
                                book.StartTime.ToString("yyyy-MM-dd HH:mm:ss"),
                                isRemindedDisplay,
                                book.IllnessTxt
                            );
                        }
                    }
                    else
                    {
                        _logger.LogInformation(
                            "[Detection Result] No appointments to remind. Waiting 5 minutes before next check."
                        );
                        await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                        continue;
                    }

                    // 2. Iterate through appointments and send reminders
                    var httpClient = _httpClientFactory.CreateClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(10);

                    foreach (var book in reminderBooks)
                    {
                        _logger.LogInformation(
                            "[Processing Appointment] Appointment ID: {BookId}, User ID: {UserId}, Start Time: {StartTime}",
                            book.Id,
                            book.UserId,
                            book.StartTime.ToString("yyyy-MM-dd HH:mm:ss")
                        );

                        // ========== Core logic: query LoginDO using existing SelectById method ==========
                        LoginDO? loginDO = LoginMapper.SelectById(book.UserId);
                        if (loginDO == null || string.IsNullOrEmpty(loginDO.Username))
                        {
                            _logger.LogWarning(
                                "[Skip Appointment] User ID {UserId} not found in login table or username (email) is empty. Skipping.",
                                book.UserId
                            );
                            continue;
                        }

                        // Use username as recipient email
                        string userEmail = loginDO.Username;
                        _logger.LogInformation(
                            "[Related Query] User ID {UserId} corresponds to email (login.username): {UserEmail}",
                            book.UserId,
                            userEmail
                        );

                        // Original userInfo query (can be kept if additional user info is needed)
                        var userInfo = UserInfoMapper.SelectByUserId(book.UserId);
                        if (userInfo == null)
                        {
                            _logger.LogWarning(
                                "[Notice] No user_info record found for User ID {UserId}, but this does not affect email sending (using login.username).",
                                book.UserId
                            );
                        }

                        string appointmentInfo = $"Time: {book.StartTime:yyyy-MM-dd HH:mm}";
                        _logger.LogInformation(
                            "[API Call] Preparing to send reminder via API Gateway. Email: {Email}, AppointmentInfo: {AppointmentInfo}",
                            userEmail,
                            appointmentInfo
                        );

                        var requestBody = new
                        {
                            UserContact = userEmail, // Use login.username as recipient email
                            AppointmentInfo = appointmentInfo
                        };

                        var jsonContent = new StringContent(
                            JsonSerializer.Serialize(requestBody),
                            Encoding.UTF8,
                            "application/json"
                        );

                        var response = await httpClient.PostAsync(ApiGatewayUrl, jsonContent, stoppingToken);

                        _logger.LogInformation(
                            "[API Response] API Gateway returned status code: {StatusCode}",
                            response.StatusCode
                        );

                        if (response.IsSuccessStatusCode)
                        {
                            BookMapper.UpdateReminderStatus(book.Id, true);
                            _logger.LogInformation(
                                "[Reminder Sent] Appointment reminder sent to {Email}. Appointment ID {BookId} marked as reminded.",
                                userEmail,
                                book.Id
                            );
                        }
                        else
                        {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            _logger.LogError(
                                "[Reminder Failed] Appointment ID {BookId} failed to send. StatusCode: {StatusCode}, Error: {ErrorContent}",
                                book.Id,
                                response.StatusCode,
                                errorContent
                            );
                        }
                    }

                    _logger.LogInformation(
                        "[Detection Cycle] This reminder cycle is complete. Waiting 5 minutes before the next cycle."
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "[Runtime Exception] Appointment reminder service encountered an error. Message: {Message}",
                        ex.Message
                    );
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }

            _logger.LogInformation("[Appointment Reminder Service] Stopped.");
        }
    }
}
