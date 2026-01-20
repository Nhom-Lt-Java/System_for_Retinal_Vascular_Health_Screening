package com.aura.retinal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false) // Để false để app không crash nếu chưa config mail trong properties
    private JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            System.out.println("Mail sender not configured. Simulating sending email to: " + to);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}