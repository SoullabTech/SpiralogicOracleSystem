import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { spiralogicAstrologyService } from '../services/spiralogicAstrologyService';
import { spiralogicReportPdfService } from '../services/spiralogicReportPdfService';
import { supabase } from '../lib/supabaseClient';
import { z } from 'zod';

export const spiralogicReportRouter = Router();

// Validation schema for birth data
const birthDataSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    timezone: z.string(),
    placeName: z.string().optional()
  })
});

// Generate Spiralogic Report
spiralogicReportRouter.post('/generate', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate birth data
    const validationResult = birthDataSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid birth data',
        details: validationResult.error.errors
      });
    }
    
    const birthData = validationResult.data;
    
    // Step 1: Calculate precise birth chart
    const birthChart = await spiralogicAstrologyService.calculatePreciseBirthChart(birthData);
    birthChart.userId = userId;
    
    // Step 2: Save birth chart to database
    const savedChart = await spiralogicAstrologyService.saveBirthChart(
      userId,
      birthData,
      birthChart
    );
    
    // Step 3: Map to Spiralogic phases
    const phaseMapping = spiralogicAstrologyService.mapToSpiralogicPhases(birthChart);
    
    // Step 4: Generate comprehensive report
    const report = await spiralogicAstrologyService.generateSpiralogicReport(
      userId,
      savedChart.id,
      birthChart,
      phaseMapping
    );
    
    // Step 5: Generate PDF
    const pdfBlob = await spiralogicReportPdfService.generateReport(report, birthData);
    
    // Step 6: Upload PDF to Supabase Storage
    const fileName = `spiralogic-report-${userId}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });
      
    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }
    
    // Step 7: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName);
    
    // Step 8: Save report to database
    const savedReport = await spiralogicAstrologyService.saveReport(report, publicUrl);
    
    res.json({
      success: true,
      data: {
        reportId: savedReport.id,
        birthChartId: savedChart.id,
        pdfUrl: publicUrl,
        report: {
          personalOverview: report.personalOverview,
          beingArchetype: report.beingArchetype,
          becomingArchetype: report.becomingArchetype,
          elementalStrengths: Object.entries(report.elementalInsights).map(([element, insight]) => ({
            element,
            strength: insight.strength
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error generating Spiralogic report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's reports
spiralogicReportRouter.get('/my-reports', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const { data: reports, error } = await supabase
      .from('spiralogic_reports')
      .select('*, birth_charts(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        reports,
        count: reports?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Get specific report
spiralogicReportRouter.get('/:reportId', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { reportId } = req.params;
    
    const { data: report, error } = await supabase
      .from('spiralogic_reports')
      .select('*, birth_charts(*)')
      .eq('id', reportId)
      .single();
      
    if (error) throw error;
    
    // Check authorization
    if (report.user_id !== userId && report.created_by !== userId) {
      // Check if user is a client of the practitioner
      const { data: clientRelation } = await supabase
        .from('practitioner_clients')
        .select('id')
        .eq('practitioner_id', userId)
        .eq('client_id', report.user_id)
        .single();
        
      if (!clientRelation) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to view this report'
        });
      }
    }
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
});

// Regenerate report PDF
spiralogicReportRouter.post('/:reportId/regenerate-pdf', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { reportId } = req.params;
    
    // Fetch report data
    const { data: report, error } = await supabase
      .from('spiralogic_reports')
      .select('*, birth_charts(*)')
      .eq('id', reportId)
      .single();
      
    if (error) throw error;
    
    // Check authorization
    if (report.user_id !== userId && report.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to regenerate this report'
      });
    }
    
    // Check for custom branding (if practitioner)
    let customStyle = undefined;
    if (req.body.applyBranding) {
      const { data: branding } = await supabase
        .from('practitioner_branding')
        .select('*')
        .eq('practitioner_id', userId)
        .single();
        
      if (branding) {
        customStyle = {
          practitionerBranding: {
            businessName: branding.business_name,
            logoUrl: branding.logo_url,
            primaryColor: branding.primary_color,
            secondaryColor: branding.secondary_color
          }
        };
      }
    }
    
    // Generate new PDF with potential custom branding
    const pdfService = customStyle 
      ? new (await import('../services/spiralogicReportPdfService')).SpiralogicReportPdfService(customStyle)
      : spiralogicReportPdfService;
      
    const pdfBlob = await pdfService.generateReport(
      report.report_data,
      report.birth_charts.birth_location
    );
    
    // Upload new PDF
    const fileName = `spiralogic-report-${report.user_id}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName);
    
    // Update report with new PDF URL
    const { error: updateError } = await supabase
      .from('spiralogic_reports')
      .update({ pdf_url: publicUrl })
      .eq('id', reportId);
      
    if (updateError) throw updateError;
    
    res.json({
      success: true,
      data: {
        reportId,
        pdfUrl: publicUrl
      }
    });
    
  } catch (error) {
    console.error('Error regenerating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate PDF'
    });
  }
});

// Download report as HTML (for advanced customization)
spiralogicReportRouter.get('/:reportId/html', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { reportId } = req.params;
    
    // Fetch report
    const { data: report, error } = await supabase
      .from('spiralogic_reports')
      .select('*, birth_charts(*)')
      .eq('id', reportId)
      .single();
      
    if (error) throw error;
    
    // Check authorization
    if (report.user_id !== userId && report.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Generate HTML
    const html = spiralogicReportPdfService.generateHtmlTemplate(
      report.report_data,
      report.birth_charts.birth_location
    );
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('Error generating HTML:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate HTML'
    });
  }
});

// Practitioner: Generate report for client
spiralogicReportRouter.post('/client/:clientId/generate', authenticate, async (req, res) => {
  try {
    const practitionerId = req.user!.id;
    const { clientId } = req.params;
    
    // Verify practitioner-client relationship
    const { data: relation, error: relError } = await supabase
      .from('practitioner_clients')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('client_id', clientId)
      .single();
      
    if (relError || !relation) {
      return res.status(403).json({
        success: false,
        error: 'Client not found or unauthorized'
      });
    }
    
    // Validate birth data
    const validationResult = birthDataSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid birth data',
        details: validationResult.error.errors
      });
    }
    
    const birthData = validationResult.data;
    
    // Generate report for client
    const birthChart = await spiralogicAstrologyService.calculatePreciseBirthChart(birthData);
    birthChart.userId = clientId;
    
    const savedChart = await spiralogicAstrologyService.saveBirthChart(
      clientId,
      birthData,
      birthChart
    );
    
    const phaseMapping = spiralogicAstrologyService.mapToSpiralogicPhases(birthChart);
    
    const report = await spiralogicAstrologyService.generateSpiralogicReport(
      clientId,
      savedChart.id,
      birthChart,
      phaseMapping
    );
    
    // Apply practitioner branding
    const { data: branding } = await supabase
      .from('practitioner_branding')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .single();
      
    const customStyle = branding ? {
      practitionerBranding: {
        businessName: branding.business_name,
        logoUrl: branding.logo_url,
        primaryColor: branding.primary_color,
        secondaryColor: branding.secondary_color
      }
    } : undefined;
    
    const pdfService = customStyle 
      ? new (await import('../services/spiralogicReportPdfService')).SpiralogicReportPdfService(customStyle)
      : spiralogicReportPdfService;
      
    const pdfBlob = await pdfService.generateReport(report, birthData);
    
    // Upload PDF
    const fileName = `spiralogic-report-${clientId}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName);
    
    // Save report with created_by field
    const { data: savedReport, error: saveError } = await supabase
      .from('spiralogic_reports')
      .insert({
        user_id: clientId,
        birth_chart_id: savedChart.id,
        report_type: 'natal',
        report_data: report,
        pdf_url: publicUrl,
        created_by: practitionerId
      })
      .select()
      .single();
      
    if (saveError) throw saveError;
    
    res.json({
      success: true,
      data: {
        reportId: savedReport.id,
        clientId,
        pdfUrl: publicUrl,
        report: {
          personalOverview: report.personalOverview,
          beingArchetype: report.beingArchetype,
          becomingArchetype: report.becomingArchetype
        }
      }
    });
    
  } catch (error) {
    console.error('Error generating client report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate client report'
    });
  }
});