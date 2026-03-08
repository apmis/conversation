sequenceDiagram
    participant User
    participant Channel
    participant Webhook
    participant ConversationService
    participant ConversationRepo
    participant QuestionnaireService
    participant QuestionProcessor
    participant AIProcessor
    participant ResponseService
    participant ChannelSender

    Note over User,ChannelSender: Conversation Start

    User->>Channel: Send message
    Channel->>Webhook: inbound webhook
    Webhook->>ConversationService: processInboundMessage()

    ConversationService->>ConversationRepo: findActiveConversation(participantId)

    alt No active conversation
        ConversationService->>QuestionnaireService: loadQuestionnaire(code)
        QuestionnaireService-->>ConversationService: questionnaire

        ConversationService->>ConversationRepo: createConversation()

        Note right of ConversationRepo: state = START\nstatus = ACTIVE

        ConversationService->>QuestionnaireService: getStartQuestion()

        ConversationService->>ChannelSender: send(startQuestion.text)
        ChannelSender-->>User: First Question

        ConversationService->>ResponseService: saveOutboundResponse()

        ConversationService->>ConversationRepo: updateConversation()

        Note right of ConversationRepo: state = PROGRESS\ncurrentQuestion = startQuestion
    end


    loop Question Processing Loop

        User->>Channel: Send Answer
        Channel->>Webhook: inbound webhook
        Webhook->>ConversationService: processInboundMessage()

        ConversationService->>ResponseService: saveInboundResponse()

        ConversationService->>ConversationRepo: getConversation()

        ConversationService->>QuestionProcessor: processAnswer(conversation, message)

        Note over QuestionProcessor: Validate Answer

        alt Invalid
            QuestionProcessor-->>ConversationService: validationError
            ConversationService->>ChannelSender: send(validationMessage)
            ChannelSender-->>User: Validation Error
        else Valid

            Note over QuestionProcessor: Determine processing mode

            alt NONE
                QuestionProcessor->>QuestionProcessor: storeRawAnswer()
            else OPTION_PROCESSED
                QuestionProcessor->>QuestionProcessor: mapOption()
            else AI_PROCESSED
                QuestionProcessor->>AIProcessor: analyze(message, aiConfig)
                AIProcessor-->>QuestionProcessor: structuredResult
            end

            Note over QuestionProcessor: Determine Next Question

            alt Next Question Exists
                QuestionProcessor-->>ConversationService: nextQuestion

                ConversationService->>ConversationRepo: updateConversation()

                Note right of ConversationRepo: state = PROGRESS\ncurrentQuestion = nextQuestion

                ConversationService->>ChannelSender: send(nextQuestion.text)
                ChannelSender-->>User: Next Question

                ConversationService->>ResponseService: saveOutboundResponse()

            else Conversation Finished

                QuestionProcessor-->>ConversationService: completed

                ConversationService->>ConversationRepo: updateConversation()

                Note right of ConversationRepo: state = COMPLETED\nstatus = COMPLETED\nendedAt = now

                ConversationService->>ChannelSender: send("Thank you for completing the questionnaire")
                ChannelSender-->>User: Completion Message

                ConversationService->>ResponseService: saveOutboundResponse()

            end
        end

    end